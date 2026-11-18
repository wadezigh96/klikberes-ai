# Deployment Guide — Vercel

## Recommended: Flattened root (after this update)

The project now lives at the repository root.

### Option A — Vercel Dashboard (easiest)
1. Import the GitHub repo `wadezigh96/klikberes-ai`.
2. Framework Preset: **Other** (or Node.js).
3. Root Directory: leave as **`.`** (root).
4. Build Command: leave empty or `echo "No build needed"`.
5. Output Directory: leave empty.
6. Install Command: `npm install`.
7. Deploy.

After connecting Neon through the Vercel Marketplace, initialize the schema from a linked local checkout:

```bash
vercel env pull .env.local
npm install
npm run db:migrate
```

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # production
```

### Health check
After deploy, open `https://your-project.vercel.app/api/health`.
Expected: `{ "ok": true, "app": "KlikBeres AI", "version": "0.1.0" }`.

## Kane remote testing
Once the live URL is up:
```bash
APP_URL=https://your-project.vercel.app npm run kane
```

## Notes
- The server listens on `process.env.PORT` (Vercel provides this).
- Static files are served from `/public`.
- `DATABASE_URL` must be connected to the Vercel Production environment for persistent task storage.
- If you still see 404, confirm Root Directory is `.` and the latest commit is deployed.
