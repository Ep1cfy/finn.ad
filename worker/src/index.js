export default {
	async email(message, env, ctx) {
	  const id = crypto.randomUUID();
	  const receivedAt = new Date().toISOString();
	  const subject = message.headers.get("subject") || "";
	  const raw = await new Response(message.raw).text();
	  const r2Key = `emails/${receivedAt}-${id}.eml`;
  
	  await env.MAIL_BUCKET.put(r2Key, raw);
  
	  await env.DB.prepare(`
		INSERT INTO emails (
		  id,
		  received_at,
		  from_addr,
		  to_addr,
		  subject,
		  r2_key,
		  raw_size
		)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	  `).bind(
		id,
		receivedAt,
		message.from,
		message.to,
		subject,
		r2Key,
		raw.length
	  ).run();
	},
  };