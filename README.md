# PR AI

Automated first-pass code review for GitHub pull requests. PR AI connects via GitHub OAuth, runs diffs through a two-agent AI pipeline (LLM Council), stages comments in-app, and lets developers post them to GitHub and apply one-click fixes — without cloning repos locally.

## Docs

| Document | Purpose |
|---|---|
| [AGENTS.md](./AGENTS.md) | Agent and contributor guide |
| [docs/PR-AI-PHASES.md](./docs/PR-AI-PHASES.md) | Phased implementation roadmap |
| [docs/PR-AI-PRD.md](./docs/PR-AI-PRD.md) | Product requirements |
| [mockups/v3.html](./mockups/v3.html) | UI reference (open in browser) |

## Stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript 5
- **Styling:** Tailwind CSS v4 · shadcn/ui
- **Auth:** Auth.js (next-auth v5) · GitHub OAuth (`repo` scope)
- **Database:** PostgreSQL (Neon) · Prisma 6
- **Planned:** Inngest or QStash · Vercel AI SDK

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | How to get it |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | [GitHub OAuth App](https://github.com/settings/developers) — callback `http://localhost:3000/api/auth/callback/github` |
| `DATABASE_URL` | Neon pooled Postgres connection string |
| `TOKEN_ENCRYPTION_KEY` | `openssl rand -base64 32` |

### 3. Apply database schema

```bash
npm run db:push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
src/
├── app/
│   ├── (marketing)/       # Public: landing, sign-in
│   ├── (dashboard)/       # Protected: dashboard shell + placeholders
│   └── api/auth/          # Auth.js route handler
├── components/
│   ├── ui/                # shadcn primitives
│   ├── marketing/         # Landing page sections
│   ├── dashboard/         # Sidebar, header, avatar
│   └── auth/              # GitHub sign-in / sign-out
├── lib/
│   ├── auth/              # Auth.js config, encryption, tokens
│   ├── billing/           # Billing guard stub
│   ├── core/              # Review engine (billing-agnostic)
│   ├── db/                # Prisma client
│   └── queue/             # Background jobs (Phase 3)
└── types/                 # Shared TypeScript types
prisma/
└── schema.prisma          # User, Account, Session, GitHubToken
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build (runs prisma generate)
npm run start        # Serve production build
npm run lint         # ESLint
npm run db:push      # Push schema to Neon
npm run db:migrate   # Create migration (dev)
npm run db:studio    # Prisma Studio
```

## Current status

**Phase 1 — Foundation & Auth** is complete:

- Marketing landing page and sign-in flow
- GitHub OAuth with encrypted token storage
- Session-protected dashboard shell (sidebar, avatar, placeholders)
- Settings page with GitHub connection status

**Phase 2 — GitHub Discovery** is next: repo/PR listing and review trigger. See [PR-AI-PHASES.md](./docs/PR-AI-PHASES.md).

## License

Private — not yet licensed for distribution.
