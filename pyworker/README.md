# Python Worker MVP

This is a tiny HTTP-only Python Worker sanity check. It proves the Python Workers toolchain and runtime are working, but it does not receive Cloudflare Email Routing events yet.

## Requirements

- `uv`
- Node.js

## Commands

```powershell
cd pyworker
uv run pywrangler dev
uv run pywrangler deploy
```

The `package.json` scripts only delegate to those same `uv run pywrangler ...` commands:

```powershell
npm run dev
npm run deploy
```

For inbound email storage, use the JavaScript worker in `worker/` for now. It has the `email()` handler plus D1/R2 bindings for the first mail-ingest MVP. The D1 table/schema is managed in Cloudflare, not in this repo.
