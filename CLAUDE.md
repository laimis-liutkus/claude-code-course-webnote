# CLAUDE.md

We are building the app described in @SPEC.MD . Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your relies extremely concise and focus on conveying on the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo is currently a bare `create-next-app` scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`). None of the application features described below have been implemented yet. **`SPEC.md` is the authoritative technical spec** for what this project should become — read it before implementing any feature, since it defines the DB schema, API contracts, repository function signatures, and page/component layout that new code should follow.

## Commands

Runtime/package manager is Bun (see `SPEC.md` §2.1; `bun.lock` is present but gitignored).

```bash
bun install      # install dependencies
bun run dev      # start dev server (next dev)
bun run build    # production build (next build)
bun run start    # start production server
bun run lint     # eslint
```

There is no test setup yet.

Environment variables (see `.env.example`): `BETTER_AUTH_SECRET` (32+ chars) and `DB_PATH` (SQLite file path, e.g. `data/app.db`).

## Architecture (per SPEC.md)

This is a Next.js App Router app for authenticated rich-text note-taking with public sharing, intended to use:

- **Auth:** `better-auth`, integrated via server helpers (e.g. `getCurrentUser()`/`getSession()`). Auth state must be checked server-side for `/dashboard` and `/notes/[id]`, and in every `/api/notes` route handler (401 if unauthenticated).
- **Database:** a single SQLite file accessed through Bun's built-in SQLite client using **raw SQL** (no ORM). `lib/db.ts` holds the singleton connection plus `query`/`get`/`run` wrappers; `lib/notes.ts` holds the notes repository (`createNote`, `getNoteById`, `getNotesByUser`, `updateNote`, `deleteNote`, `setNotePublic`, `getNoteByPublicSlug`). Every notes query must scope by `user_id` to enforce per-user authorization — this is the main security invariant in the app.
- **Editor:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`), content persisted as stringified TipTap JSON (`content_json`), never as raw HTML. Rendering (including the public read-only view) must go through TipTap, not `dangerouslySetInnerHTML`.
- **Sharing:** toggling a note public generates a random `public_slug` (nanoid, 16+ chars) and exposes it at `/p/{slug}` for anonymous, read-only access; disabling sharing clears the slug so the URL 404s.
- **API layer:** REST-like route handlers under `app/api/notes` (list/create, get/update/delete by id, share toggle) plus optionally `app/api/public-notes/[slug]`, following the request/response shapes documented in SPEC.md §7.
- **Pages:** `/` (marketing/landing), `/dashboard` (note list), `/notes/[id]` (editor), `/p/[slug]` (public read-only view), with auth pages under `app/(auth)/login` and `app/(auth)/register` if better-auth doesn't supply its own UI.

When implementing a feature, check SPEC.md for the exact table schema, function signature, or endpoint contract rather than inventing one — the spec is detailed and should be treated as the design source of truth unless the user says otherwise.
