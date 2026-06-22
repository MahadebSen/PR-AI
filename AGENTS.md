# AGENTS.md — PR AI Agent Guide

Instructions for AI coding agents working in this repository. Read this file first, then the linked docs for the area you are changing.

---

## Project at a Glance

**PR AI** is a full-stack Next.js app that automates first-pass code review for GitHub pull requests. It connects via GitHub OAuth, runs diffs through a two-agent AI pipeline (LLM Council), **stages comments in-app**, and lets developers post them to GitHub and apply one-click fixes — without cloning repos locally.

| Item | Value |
|---|---|
| Package name | `pr-ai` |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| Styling | Tailwind CSS v4 · shadcn/ui |
| Current state | Phase 1 complete — auth, encrypted tokens, landing, dashboard shell |
| Active phase | **Phase 2 — GitHub Discovery** (see phases doc) |

---

## Mandatory Reading (Before Coding)

| Document | When to read |
|---|---|
| [docs/PR-AI-PHASES.md](./docs/PR-AI-PHASES.md) | **Always** — confirms what belongs in the current phase and what is out of scope |
| [docs/PR-AI-PRD.md](./docs/PR-AI-PRD.md) | When implementing a feature — requirement IDs (e.g. `AUTH-1`, `CHUNK-3`) and acceptance criteria |
| [mockups/v3.html](./mockups/v3.html) | When building UI — visual reference for layout, copy tone, and interaction patterns |

**Phase discipline:** Do not implement features from a later phase unless the user explicitly asks. If a request spans phases, implement the minimum for the current phase and note follow-up work.

---

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 — Not the Next.js You Know

This project uses **Next.js 16** with breaking changes vs. older versions. Do not rely on training-data defaults.

1. **Read before writing Next.js code** — check `node_modules/next/dist/docs/` if present, otherwise [nextjs.org/docs](https://nextjs.org/docs).
2. **Heed deprecation notices** in the installed package and ESLint output.
3. **App Router only** — routes live under `src/app/`; no Pages Router.
4. **Server vs. client** — default to Server Components; add `"use client"` only when hooks, browser APIs, or event handlers require it.
5. **Route handlers** — API routes are `src/app/api/**/route.ts` exporting named HTTP method functions.
6. **Do not add** deprecated patterns (`getServerSideProps`, `_app`, `_document`, middleware config in wrong locations) without verifying against v16 docs.
<!-- END:nextjs-agent-rules -->

---

## Planned Directory Layout

Place new code in the module that matches its responsibility. Create folders as needed; do not dump unrelated logic into `page.tsx`.

```
src/
├── app/                      # Routes, layouts, route handlers (thin — delegate to lib/)
│   ├── (marketing)/          # Public: landing, sign-in
│   ├── (dashboard)/          # Protected: dashboard, review, PR detail, settings
│   └── api/                  # REST handlers; auth + billing middleware at boundary
├── components/
│   ├── ui/                   # shadcn primitives (Button, Card, Badge, …)
│   └── …                     # Feature components (ReviewCommentCard, DiffViewer, …)
├── lib/
│   ├── auth/                 # Auth.js config, session helpers, token encryption
│   ├── billing/              # BillingGuardMiddleware ONLY — no imports from core/
│   ├── core/                 # Review engine — billing-agnostic (see rules below)
│   │   ├── chunker/          # Diff filter + chunker
│   │   ├── council/          # Agent 1 Reviewer, Agent 2 Scrutinizer
│   │   ├── github/           # Comment posting, Git Data API
│   │   └── router/           # AIServiceRouter — sole LLM entry point
│   ├── db/                   # Schema, client, queries (Drizzle or Prisma — TBD)
│   └── queue/                # Inngest/QStash job definitions
└── types/                    # Shared TypeScript types (review JSON schema, etc.)
```

**Rule of thumb:** `app/` wires HTTP/UI → `lib/` owns business logic → `components/` renders.

---

## Architecture Rules (Non-Negotiable)

These come from the PRD and prevent costly refactors later.

### 1. Decoupled core engine

`src/lib/core/**` must **never** import from `src/lib/billing/**` or subscription models. AI, chunking, and GitHub write logic stay billing-agnostic.

### 2. Billing at the middleware boundary

Every review-triggering route (`POST /api/review`, `POST /api/fix/**`) passes through `BillingGuardMiddleware` before the handler. MVP: pass-through returning `{ allowed: true }`. Future tier checks live only here.

### 3. All LLM calls via AIServiceRouter

No direct `openai`, `@ai-sdk`, or provider SDK imports outside `src/lib/core/router/`. Business logic requests completions through the router (platform key or user BYOK).

### 4. Async review pipeline

Never run the full LLM Council synchronously inside a route handler. Enqueue a background job; return a `jobId` immediately.

### 5. Staged comments (canonical UX)

Comments are saved with `postedToGitHub: false` after review. Posting to GitHub is an explicit user action ("Post all to GitHub"), not automatic. See Phase 3–4 in [PR-AI-PHASES.md](./docs/PR-AI-PHASES.md).

### 6. No local repo cloning

Fixes use the GitHub Git Data API only. Do not add git clone / filesystem repo workflows on the server.

---

## Security Rules

| Rule | Detail |
|---|---|
| **Encrypt at rest** | GitHub OAuth tokens and user API keys — AES-256-GCM (or vault); never plaintext in DB |
| **Never expose secrets** | Tokens/keys must not appear in client responses, logs, LLM prompts, or error messages |
| **OAuth scope** | Request `repo` scope only — no admin/delete scopes |
| **Validate PR URLs** | Regex-parse `github.com/{owner}/{repo}/pull/{number}`; reject malformed input; no SSRF |
| **Confirm before push** | Fix commits require explicit user confirmation — no silent pushes |
| **No force push** | If file SHA drifted, fail with a clear message |
| **Env vars** | Secrets in `.env.local` only; never commit `.env*` files with real values |

---

## UI & Design Conventions

Reference: [mockups/v3.html](./mockups/v3.html)

- **Theme:** GitHub-inspired dark UI — canvas `#070a0e`, surface `#0d131a`, accent purple `#a371f7`, link blue `#58a6ff`
- **Layout:** Marketing pages full-width; dashboard uses sidebar (240px) + main content
- **Components:** Cards with subtle borders/glow, severity badges (`critical` red, `warning` orange, `info` blue/green), monospace for file paths and diffs
- **Screens to mirror:** Home → Sign in → Dashboard → Review results → Fix preview → PR detail
- **Copy tone:** Mockup uses playful labels ("Matrix Metric Run"); production UI can simplify while keeping the same information hierarchy
- **Stack:** Prefer shadcn/ui + Tailwind utilities; extract repeated patterns into `components/ui/` rather than inline duplication
- **Responsive:** Desktop + tablet required; mobile read-only is acceptable for MVP (NFR-UX-4)

When translating mockup HTML to React, preserve structure and spacing — do not invent a new visual language.

---

## API Conventions

| Method | Route | Middleware | Notes |
|---|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | — | Auth.js |
| `GET` | `/api/repos` | Auth | Paginated repo list |
| `GET` | `/api/repos/[owner]/[repo]/pulls` | Auth | Open PRs |
| `POST` | `/api/review` | Auth + Billing | Returns `{ jobId }` |
| `GET` | `/api/review/[jobId]` | Auth | Job status |
| `GET` | `/api/review/[jobId]/comments` | Auth | Staged comments |
| `POST` | `/api/fix/[commentId]/push` | Auth + Billing | Git Data API push |
| `GET/PUT` | `/api/settings` | Auth | BYOK keys (Phase 6) |

**Handler pattern:**

```typescript
// src/app/api/review/route.ts — thin handler
export async function POST(request: Request) {
  const session = await requireSession();           // auth
  await billingGuard.check(session.user.id);        // billing boundary
  const jobId = await enqueueReviewJob(/* … */);    // delegate to lib/
  return Response.json({ jobId });
}
```

**Errors:** Return actionable messages (`"Re-authenticate GitHub"`, not `"401"`).

---

## Data Model (Quick Reference)

Core entities — full schema in [PR-AI-PRD.md §5](./docs/PR-AI-PRD.md):

- `User` — GitHub identity
- `GitHubToken` — encrypted OAuth token
- `UserSettings` — encrypted BYOK keys, provider preference
- `ReviewJob` — repo, PR number, status lifecycle, token metrics
- `ReviewComment` — filePath, diffPosition, axis, severity, body, `postedToGitHub`
- `FixSuggestion` — original/corrected code, push status

**Review job statuses:** `queued` → `chunking` → `reviewing` → `scrutinizing` → `completed` | `failed`

**Comment axes:** Security · Performance · Code Quality · Test Suggestions

**Severities:** `critical` · `warning` · `info`

---

## Code Style

Match the existing codebase:

- **TypeScript** strict mode; explicit types on public APIs and route handlers
- **Imports:** `import type { … }` for type-only imports; path alias `@/` → `src/` (once configured in tsconfig)
- **Components:** Functional; PascalCase filenames for components (`ReviewCommentCard.tsx`)
- **Functions:** camelCase; async handlers return typed results or throw domain errors
- **Minimal scope:** Smallest correct diff; no drive-by refactors or unrelated files
- **Comments:** Only for non-obvious business logic — not for self-explanatory code
- **Tests:** Add only when requested or when covering non-trivial behavior

Run before finishing:

```bash
npm run lint
npm run build
```

Fix lint/build errors you introduce. Do not disable ESLint rules to greenwash failures.

---

## Commands

```bash
npm run dev      # Local dev server → http://localhost:3000
npm run build    # Production build — must pass before PR
npm run start    # Serve production build
npm run lint     # ESLint (eslint-config-next)
```

---

## Agent Workflow Checklist

Use this sequence for feature work:

1. **Identify phase** — [PR-AI-PHASES.md](./docs/PR-AI-PHASES.md): is this in scope now?
2. **Find requirements** — PRD IDs and acceptance criteria
3. **Check mockup** — layout/interaction for any UI touch
4. **Pick the right module** — core vs. billing vs. app boundary
5. **Implement minimally** — meet acceptance criteria; no future-phase extras
6. **Verify** — `npm run lint && npm run build`
7. **Report** — what was done, what is deferred to a later phase, any open decisions touched

---

## Out of Scope (Unless User Explicitly Requests)

- Razorpay / payments / subscription tiers (Phase 7+)
- GitLab, Bitbucket, other VCS providers
- Team/org accounts and shared billing
- Custom review rule configuration UI
- On-premise / self-hosted deployment
- Server-side git clone of user repositories
- Auto-posting comments to GitHub without user action
- Direct LLM SDK calls outside `AIServiceRouter`
- Billing imports inside `lib/core/`

---

## Open Decisions (Do Not Assume — Ask or Stub)

| # | Question | Default for agents |
|---|---|---|
| 1 | Comment attribution: user vs. GitHub App bot? | Stub with config flag; document choice |
| 2 | ORM: Drizzle vs. Prisma? | **Prisma** (chosen in Phase 1) |
| 3 | Queue: Inngest vs. QStash? | Ask user before worker setup |
| 4 | Default models for Agent 1 / Agent 2? | Use env-configured model IDs |
| 5 | Re-review same PR: dedupe or fresh comments? | New job; no auto-dedup until decided |

---

## Anti-Patterns to Avoid

```typescript
// ❌ LLM call in a route handler
export async function POST() {
  const result = await openai.chat.completions.create(/* … */);
}

// ✅ Enqueue job; router handles LLM inside worker
export async function POST() {
  const jobId = await enqueueReviewJob(input);
  return Response.json({ jobId });
}
```

```typescript
// ❌ Billing check inside council agent
import { checkSubscription } from '@/lib/billing/subscription';

// ✅ Billing only in middleware / route boundary
await billingGuard.check(userId);
```

```typescript
// ❌ Auto-post all comments after review completes
await postAllCommentsToGitHub(comments);

// ✅ Persist staged; user triggers post
await saveComments({ …comments, postedToGitHub: false });
```

---

## Related Files

| Path | Purpose |
|---|---|
| `docs/PR-AI-PRD.md` | Full requirements, NFRs, data model, agent prompts |
| `docs/PR-AI-PHASES.md` | Phased roadmap and exit criteria |
| `mockups/v3.html` | UI reference (open in browser) |
| `CLAUDE.md` | Points to this file |
| `src/app/layout.tsx` | Root layout — title already set to "PR AI" |
