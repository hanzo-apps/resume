# resume-curriculum — agent notes

Curriculum — a polished, print-friendly online resume, built on the canonical
Hanzo app stack: Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) +
`@hanzo/base` (data). It is a real, buildable fork of `hanzo-apps/hanzo-starter`;
keep every surface REAL — it must build and run, no fabricated UI.

## The app

Two views over two Base collections:

- **Resume** (`src/views/resume.tsx`) — the read/print surface. Renders the one
  `profile` header and every `entries` row grouped by section, in one centered
  typographic column that prints clean.
- **Editor** (`src/views/editor.tsx`) — the write surface. Upserts the single
  `profile` row (newest is the live one) and appends/removes `entries`.
- `src/views/home.tsx` is the signed-in shell: a Resume ⇄ Editor toggle, a Print
  button, and Sign out. The toolbar is removed on `beforeprint` so the resume
  prints alone. `src/views/signed-out.tsx` is the pre-auth landing (hero + a live
  preview of the resume paper).

`src/lib/sections.ts` is the one list of canonical sections (Experience /
Projects / Skills / Education) + the ordering used by both views. `src/lib/models.ts`
is the shared `Profile`/`Entry` row types.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user. Curriculum fixes the
  **light** theme (a resume is paper; light prints clean).
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. Auth
  reads `VITE_HANZO_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). The only non-gui styling is a page-level `@media print` block in
  `index.html` (print margins / color-adjust — Tamagui can't express print media).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingVertical`/
  `alignSelf`/`borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/
  `self`/`rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
- **`Button` has no `color` prop.** Set label color via `<Button.Text color=…>`
  as a child (see the segmented toggle in `home.tsx` and the section picker in
  `editor.tsx`). `Button` uses `onPress`; `Input`/`TextArea` use
  `value`/`onChangeText`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). `when` is a
  reserved word — it stays quoted (`"when"`). Keep this file in lockstep with
  `resume.tsx` / `editor.tsx`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native, rule `@request.auth.org_id = org`). Runtime read/write
  is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-<app>` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` (897 modules) · renders under Vite
with the light-theme resume paper + editor.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
