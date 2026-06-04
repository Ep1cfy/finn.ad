from workers import WorkerEntrypoint, Response
async def parse_email(self):
    ### Return email lines to a dict
    result = await self.env.MAIL_DB.prepare(
        "SELECT id, sender, recipient, subject, received_at FROM emails ORDER BY received_at DESC"
    ).all()

    return {
        "inbox": result.results.to_py()
    }
    
class Default(WorkerEntrypoint):
    async def fetch(self, request):
        return Response(parse_email())
