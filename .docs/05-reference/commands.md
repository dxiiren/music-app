# Commands Reference

> **TL;DR** Everything daily is a `just` recipe (run `just` to list them). `start`/`dev`
> serve on **:8115 `--strictPort`**, `stop` kills only this repo's node processes, `lint`
> and `format` write to files, and `test` forces vitest into single-run mode because the
> npm script would otherwise hang in watch + UI mode.

## just recipes

| Recipe | Runs | Notes |
| --- | --- | --- |
| `just` | `just --list` | shows every recipe with its one-line summary |
| `just install` | `npm ci` (lockfile) or `npm install` | `prepare` script also installs the Cypress binary — first run takes minutes |
| `just start` | `npm run dev -- --port 8115 --strictPort` in a background window | runs `stop` first so old servers never linger |
| `just dev` | same, foreground | Ctrl+C to stop |
| `just stop` | kills node.exe whose command line contains this repo's path | project-scoped — other repos' servers survive |
| `just build` | `npm run build` (`vite build`) | emits `dist/` incl. PWA `sw.js`; one >500 kB chunk warning is known (Firebase SDK) |
| `just preview` | `npm run preview -- --port 8115` | serves `dist/` — run `just build` first |
| `just lint` | `npm run lint` (`eslint . --fix`) | **edits files** |
| `just format` | `npm run format` (`prettier --write src/`) | **edits files** |
| `just test [flags]` | `npm run test:unit -- --run [flags]` | single pass; all 15 spec files / 90 tests green, no Firebase keys needed |
| `just claudex` / `claudeo` / `claudeh` | Claude Code with all permissions | Sonnet / Opus / Haiku |

Override the port for one call with `PORT=nnnn just start` (default 8115 — stay on it).

## npm scripts (the layer underneath)

| Script | Command | Gotcha |
| --- | --- | --- |
| `dev` | `vite` | port comes from the recipe's `--port 8115 --strictPort` |
| `build` | `vite build` | |
| `preview` | `vite preview` | |
| `test:unit` | `vitest --ui` | **watch mode + browser UI — never exits**; always add `-- --run` (what `just test` does) |
| `test:e2e` | `start-server-and-test preview :4173 'cypress run --e2e'` | needs a prior build + filled `.env`; not a just recipe on purpose |
| `test:e2e:dev` | dev server on :4173 + `cypress open` | interactive |
| `prepare` | `cypress install` | runs automatically on `npm ci`/`install` |
| `lint` | `eslint . --fix` | writes |
| `format` | `prettier --write src/` | writes |

## Related docs

| Doc | Why |
| --- | --- |
| [`../03-development/workflow.md`](../03-development/workflow.md) | When to run what |
| [`../06-troubleshooting/common-issues.md`](../06-troubleshooting/common-issues.md) | When a command misbehaves |
| [`project-layout.md`](project-layout.md) | Where the files these commands touch live |
