# Portfolio — AI-Powered Developer Portfolio

An AI-powered, self-updating developer portfolio that crawls your public GitHub repositories, analyzes them with Groq, and surfaces the best work automatically — with human oversight at every step.

## Structure

```
port-folio/
├── frontend/   — SvelteKit SPA (TypeScript + TailwindCSS)
└── backend/    — Express.js serverless (TypeScript + Prisma + PostgreSQL)
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, GITHUB_TOKEN, GITHUB_USERNAME, GROQ_API_KEY, ADMIN_SECRET

npm install
npx prisma db push        # creates tables
npx prisma generate       # generates client
npm run dev               # starts at http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # starts at http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:4000`.

## How the AI Pipeline Works

1. **Sync** — `POST /api/admin/pipeline/sync` crawls your public GitHub repos and upserts them into the DB
2. **Analyze** — `POST /api/admin/pipeline/analyze` sends each unanalyzed repo to Groq with a rich prompt
3. **Review** — Go to `/admin` and approve/reject/override each AI recommendation
4. **Display** — Approved repos appear at `/projects` and featured ones on the home page

Or run the full pipeline in one shot: `POST /api/admin/pipeline/full`

## Pages

| Route | Description |
|---|---|
| `/` | Hero + featured projects |
| `/projects` | All repos with search + language filter |
| `/projects/:owner/:repo` | Repo detail with AI scores, README, stats |
| `/analytics` | Star trends, language breakdown, snapshot history |
| `/admin` | Pipeline controls + AI review queue |

## Environment Variables

See `backend/.env.example` for all required variables.
