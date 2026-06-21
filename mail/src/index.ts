interface Env {
	DB: D1Database;
	MAIL_BUCKET: R2Bucket;
  
	DRY_RUN?: string;
	RETENTION_DAYS?: string;
	MAX_EMAILS?: string;
	MAX_R2_BYTES?: string;
	BATCH_SIZE?: string;
	MAX_PASSES?: string;
  }
  
  type EmailRow = {
	id: string;
	received_at: string;
	r2_key: string | null;
	raw_size: number | null;
  };
  
  type StatsRow = {
	email_count: number;
	total_r2_bytes: number;
	oldest_email: string | null;
	newest_email: string | null;
  };
  
  type CleanupResult = {
	dryRun: boolean;
	before: StatsRow;
	after: StatsRow;
	deletedRows: number;
	deletedR2Objects: number;
	freedBytes: number;
	passes: number;
	reasons: string[];
	errors: string[];
  };
  
  function intFromEnv(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
  
	if (!Number.isFinite(parsed) || parsed < 0) {
	  return fallback;
	}
  
	return Math.floor(parsed);
  }
  
  function boolFromEnv(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) return fallback;
	return value.toLowerCase() === "true";
  }
  
  function isoDateDaysAgo(days: number): string {
	const ms = Date.now() - days * 24 * 60 * 60 * 1000;
	return new Date(ms).toISOString();
  }
  
  async function getStats(env: Env): Promise<StatsRow> {
	const row = await env.DB.prepare(`
	  SELECT
		COUNT(*) AS email_count,
		COALESCE(SUM(raw_size), 0) AS total_r2_bytes,
		MIN(received_at) AS oldest_email,
		MAX(received_at) AS newest_email
	  FROM emails
	`).first<StatsRow>();
  
	return {
	  email_count: row?.email_count ?? 0,
	  total_r2_bytes: row?.total_r2_bytes ?? 0,
	  oldest_email: row?.oldest_email ?? null,
	  newest_email: row?.newest_email ?? null,
	};
  }
  
  async function getExpiredEmails(
	env: Env,
	cutoffIso: string,
	limit: number,
  ): Promise<EmailRow[]> {
	const result = await env.DB.prepare(`
	  SELECT id, received_at, r2_key, raw_size
	  FROM emails
	  WHERE datetime(received_at) < datetime(?)
	  ORDER BY datetime(received_at) ASC
	  LIMIT ?
	`)
	  .bind(cutoffIso, limit)
	  .all<EmailRow>();
  
	return result.results ?? [];
  }
  
  async function getOldestEmails(
	env: Env,
	limit: number,
  ): Promise<EmailRow[]> {
	const result = await env.DB.prepare(`
	  SELECT id, received_at, r2_key, raw_size
	  FROM emails
	  ORDER BY datetime(received_at) ASC
	  LIMIT ?
	`)
	  .bind(limit)
	  .all<EmailRow>();
  
	return result.results ?? [];
  }
  
  function getPressureReasons(
	stats: StatsRow,
	maxEmails: number,
	maxR2Bytes: number,
  ): string[] {
	const reasons: string[] = [];
  
	if (stats.email_count > maxEmails) {
	  reasons.push(`email_count ${stats.email_count} > MAX_EMAILS ${maxEmails}`);
	}
  
	if (stats.total_r2_bytes > maxR2Bytes) {
	  reasons.push(
		`total_r2_bytes ${stats.total_r2_bytes} > MAX_R2_BYTES ${maxR2Bytes}`,
	  );
	}
  
	return reasons;
  }
  
  async function deleteBatch(
	env: Env,
	rows: EmailRow[],
	dryRun: boolean,
  ): Promise<{
	deletedRows: number;
	deletedR2Objects: number;
	freedBytes: number;
	errors: string[];
  }> {
	let deletedRows = 0;
	let deletedR2Objects = 0;
	let freedBytes = 0;
	const errors: string[] = [];
  
	if (rows.length === 0) {
	  return { deletedRows, deletedR2Objects, freedBytes, errors };
	}
  
	for (const row of rows) {
	  freedBytes += row.raw_size ?? 0;
  
	  if (dryRun) {
		if (row.r2_key) deletedR2Objects++;
		continue;
	  }
  
	  if (!row.r2_key) {
		continue;
	  }
  
	  try {
		await env.MAIL_BUCKET.delete(row.r2_key);
		deletedR2Objects++;
	  } catch (error) {
		errors.push(
		  `Failed deleting R2 object ${row.r2_key} for email ${row.id}: ${
			error instanceof Error ? error.message : String(error)
		  }`,
		);
	  }
	}
  
	if (dryRun) {
	  deletedRows = rows.length;
	  return { deletedRows, deletedR2Objects, freedBytes, errors };
	}
  
	try {
	  const statements = rows.map((row) =>
		env.DB.prepare(`DELETE FROM emails WHERE id = ?`).bind(row.id)
	  );
  
	  await env.DB.batch(statements);
	  deletedRows = rows.length;
	} catch (error) {
	  errors.push(
		`Failed deleting D1 rows: ${
		  error instanceof Error ? error.message : String(error)
		}`,
	  );
	}
  
	return { deletedRows, deletedR2Objects, freedBytes, errors };
  }
  
  async function cleanup(env: Env): Promise<CleanupResult> {
	const dryRun = boolFromEnv(env.DRY_RUN, true);
  
	const retentionDays = intFromEnv(env.RETENTION_DAYS, 90);
	const maxEmails = intFromEnv(env.MAX_EMAILS, 50_000);
	const maxR2Bytes = intFromEnv(env.MAX_R2_BYTES, 400_000_000);
	const batchSize = Math.min(intFromEnv(env.BATCH_SIZE, 250), 500);
	const maxPasses = Math.min(intFromEnv(env.MAX_PASSES, 5), 20);
  
	const cutoffIso = isoDateDaysAgo(retentionDays);
  
	const before = await getStats(env);
  
	let deletedRows = 0;
	let deletedR2Objects = 0;
	let freedBytes = 0;
	let passes = 0;
  
	const reasons: string[] = [];
	const errors: string[] = [];
  
	// Pass 1: retention cleanup.
	passes++;
  
	const expiredRows = await getExpiredEmails(env, cutoffIso, batchSize);
  
	if (expiredRows.length > 0) {
	  reasons.push(`Deleting emails older than ${retentionDays} days`);
  
	  const result = await deleteBatch(env, expiredRows, dryRun);
  
	  deletedRows += result.deletedRows;
	  deletedR2Objects += result.deletedR2Objects;
	  freedBytes += result.freedBytes;
	  errors.push(...result.errors);
	}
  
	// In dry-run mode, do only one simulated pass so the numbers stay readable.
	if (!dryRun) {
	  while (passes < maxPasses) {
		const current = await getStats(env);
		const pressureReasons = getPressureReasons(
		  current,
		  maxEmails,
		  maxR2Bytes,
		);
  
		if (pressureReasons.length === 0) {
		  break;
		}
  
		reasons.push(...pressureReasons);
		passes++;
  
		const oldestRows = await getOldestEmails(env, batchSize);
  
		if (oldestRows.length === 0) {
		  break;
		}
  
		const result = await deleteBatch(env, oldestRows, dryRun);
  
		deletedRows += result.deletedRows;
		deletedR2Objects += result.deletedR2Objects;
		freedBytes += result.freedBytes;
		errors.push(...result.errors);
	  }
	} else {
	  const pressureReasons = getPressureReasons(before, maxEmails, maxR2Bytes);
  
	  if (pressureReasons.length > 0 && expiredRows.length === 0) {
		reasons.push(...pressureReasons);
  
		const oldestRows = await getOldestEmails(env, batchSize);
		const result = await deleteBatch(env, oldestRows, dryRun);
  
		deletedRows += result.deletedRows;
		deletedR2Objects += result.deletedR2Objects;
		freedBytes += result.freedBytes;
		errors.push(...result.errors);
	  }
	}
  
	const after = await getStats(env);
  
	if (reasons.length === 0) {
	  reasons.push("No cleanup needed");
	}
  
	return {
	  dryRun,
	  before,
	  after,
	  deletedRows,
	  deletedR2Objects,
	  freedBytes,
	  passes,
	  reasons,
	  errors,
	};
  }
  
  export default {
	async scheduled(
	  controller: ScheduledController,
	  env: Env,
	  ctx: ExecutionContext,
	): Promise<void> {
	  ctx.waitUntil(
		cleanup(env)
		  .then((result) => {
			console.log("mail cleanup result:", JSON.stringify(result));
		  })
		  .catch((error) => {
			console.error(
			  "mail cleanup failed:",
			  error instanceof Error ? error.message : String(error),
			);
		  }),
	  );
	},
  
	async fetch(request: Request, env: Env): Promise<Response> {
	  const url = new URL(request.url);
  
	  if (url.pathname === "/status") {
		const stats = await getStats(env);
		return Response.json(stats);
	  }
  
	  return new Response("mail-cleaner ok");
	},
  };