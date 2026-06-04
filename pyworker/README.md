# Python Worker MVP

This is a tiny HTTP-only Python Worker sanity check. It proves the Python Workers toolchain and runtime are working, but it does not receive Cloudflare Email Routing events yet.

## Requirements

- `uv`
- Node.js

## Commands

```powershell
cd pyworker
python -m uv run pywrangler dev
python -m uv run pywrangler deploy
```

The `package.json` scripts delegate to the same `pywrangler` commands:

```powershell
npm run setup
npm run dev
npm run deploy
```

## Cloudflare Workers Builds

Use these settings for the connected GitHub deployment:

```text
Root directory: pyworker
Build command: npm run setup
Deploy command: npm run deploy
```

If non-production branch builds are enabled, set the non-production deploy command to `npm run deploy` for this MVP too. The Worker name in `wrangler.toml` must stay `finn-python-worker` so deploys target `finn-python-worker.ooazi-fk.workers.dev`.

For inbound email storage, use the JavaScript worker in `worker/` for now. It has the `email()` handler plus D1/R2 bindings for the first mail-ingest MVP. The D1 table/schema is managed in Cloudflare, not in this repo.
