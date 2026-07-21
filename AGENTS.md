# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Curriculum, a print-friendly online resume. Vite + React 19 + `@hanzo/gui`
+ `@hanzo/iam` + `@hanzo/base`. Two views — a typographic **Resume** and an
**Editor** — over the `profile` + `entries` Base collections. Keep it minimal and
real. `@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); `Button`
label color goes through `<Button.Text>`. `schema.sql` is the Base data contract
(keep it in lockstep with the views). Prove changes with `npm run build`
(tsc + vite). Never build a container image locally — Hanzo Cloud owns deploys.
