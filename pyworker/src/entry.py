from email import policy
from email.parser import Parser
from html import escape
from urllib.parse import parse_qs, urlparse

from workers import WorkerEntrypoint, Response


class Default(WorkerEntrypoint):
    async def parse_email(self):
        result = await self.env.MAIL_DB.prepare(
            """
            SELECT
                id,
                from_addr AS sender,
                to_addr AS recipient,
                subject,
                received_at
            FROM emails
            ORDER BY received_at DESC
            """
        ).all()

        rows = result.results

        if hasattr(rows, "to_py"):
            rows = rows.to_py()

        return {
            row["id"]: row
            for row in rows
        }

    async def get_email_html(self, email_id):
        result = await self.env.MAIL_DB.prepare(
            "SELECT r2_key FROM emails WHERE id = ? LIMIT 1"
        ).bind(email_id).all()

        rows = result.results.to_py()
        if not rows:
            return Response("Email not found", status=404)

        r2_key = rows[0]["r2_key"]
        obj = await self.env.MAIL_BUCKET.get(r2_key)

        if obj is None:
            return Response("Raw email not found in R2", status=404)

        raw_email = await obj.text()
        message = Parser(policy=policy.default).parsestr(raw_email)
        part = message.get_body(preferencelist=("html", "plain"))
        metadata = parse_email()
        if part is None:
            body = "<p>No readable email body.</p>"
        elif part.get_content_type() == "text/html":
            body = f"""
            <div id=\"subject\"><h1>{escape(metadata["email_id"]["subject"])}</h1></div>
            <div id=\"from\"><p>from {escape(metadata["email_id"]["sender"])}</p></div>
            <div id=\"to\"><p> to {escape(metadata["email_id"]["recipient"])}</p></div>
            <div id=\"body\"><p>{escape(part.get_content())}</p></div>
            """
            
        else:
            body = f"<pre>{escape(part.get_content())}</pre>"

        return Response(
            body,
            headers={
                "Content-Type": "text/html; charset=utf-8",
                "Content-Security-Policy": "default-src 'none'; img-src data: https:; style-src 'unsafe-inline';",
            },
        )

    async def fetch(self, request):
        url = urlparse(str(request.url))
        params = parse_qs(url.query)

        email_id = params.get("id", [None])[0]
        requested_format = params.get("format", ["json"])[0]

        if email_id and requested_format == "html":
            return await self.get_email_html(email_id)

        emails = await self.parse_email()
        return Response.json(emails)
