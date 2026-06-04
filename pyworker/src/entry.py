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

    async def fetch(self, request):
        data = await self.parse_email()
        return Response.json(data)