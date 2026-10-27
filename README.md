# ContextOS — Personal Memory & Decision Intelligence Platform

A web app for capturing, searching, and reflecting on personal notes and decisions. Ask AI-powered questions about your own saved memories.

## What it does

- **Capture memories** — notes, ideas, decisions, goals, observations, reflections
- **Search & filter** — by keyword, type, and tag
- **AI Recall** — ask natural language questions; the AI answers only from what you've actually written
- **Browser-only storage** — memories are saved in your browser's localStorage; there is no account system, sync, or cloud storage

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| AI | Anthropic Claude Haiku via server-side API route |
| Storage | Browser localStorage (no server-side database) |
| Deployment | Vercel |

## Quick start

```bash
npm install
cp .env.example .env.local
# edit .env.local and add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI recall) | From console.anthropic.com |

Copy `.env.example` to `.env.local` and fill in your key.

## Architecture

```
app/
  dashboard/page.tsx      — overview + recent memories
  memories/page.tsx       — list + search + filter
  memories/new/page.tsx   — create form
  memories/[id]/page.tsx  — detail + edit
  recall/page.tsx         — AI recall chat interface
  settings/page.tsx       — storage info, sample data, clear data
  api/recall/route.ts     — secure Claude API route (key never hits browser)

components/
  Sidebar.tsx             — persistent navigation
  MemoryCard.tsx          — memory display card
  MemoryForm.tsx          — create/edit form
  EmptyState.tsx          — empty state component

lib/
  storage.ts              — localStorage CRUD, search, optional sample data
  utils.ts                — formatDate, cn, truncate

types/index.ts            — shared TypeScript types

supabase/schema.sql       — unused draft schema for possible future server-side storage
```

## AI Recall design

The `/api/recall` route:
1. Receives question + memories array from the client
2. Keyword-scores memories to select the 8 most relevant
3. Sends those + the question to Claude Haiku with a strict grounding prompt
4. Returns the answer + citation metadata
5. The `ANTHROPIC_API_KEY` is accessed server-side only

Claude is instructed to cite only what is in the memories and say so if the evidence is insufficient.

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Add `ANTHROPIC_API_KEY` in Vercel's Environment Variables dashboard.

## Sample data

The app starts empty. Settings → "Add sample memories" adds four clearly tagged `sample` memories alongside any you already have (it never overwrites existing data). They include a deliberate goal/decision tension that AI Recall can surface.

## Known limitations

- localStorage means data is local to one browser and device (no sync, no auth) and is lost if browser data is cleared
- `supabase/schema.sql` is a draft only; Supabase is not integrated
- Memory graph and contradiction detection deferred from v1
- AI recall sends the memories from the client — production would query a server-side database instead
