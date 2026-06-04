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
            "inbox": rows
        }
    async def get_email_body(self, email_id):
        result = await self.env.DB.prepare(
            "SELECT r2_key FROM emails WHERE id = ? LIMIT 1"
        ).bind(email_id).all()

        rows = result.results.to_py()
        if not rows:
            return {"error": "email not found"}

        r2_key = rows[0]["r2_key"]
        obj = await self.env.MAIL_BUCKET.get(r2_key)

        if obj is None:
            return {"error": "raw email not found in R2", "r2_key": r2_key}

        raw_email = await obj.text()

        # quick/simple body extraction from raw .eml
        body = raw_email.split("\r\n\r\n", 1)[-1]

        return {
            "id": email_id,
            "r2_key": r2_key,
            "body": body,
        }
    async def fetch(self, request):
        data = await self.parse_email()
        body = await self.get_email_body()
        for i in body:
            data["inbox"][i]["body"] = body
        return Response.json(data)