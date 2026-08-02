# Getting Started

> **TL;DR** `pwsh ./setup.ps1` once, reopen PowerShell, `just install`, `just start`, open
> `http://localhost:8115`. Expect a "Firebase not configured" setup banner until you copy
> `.env.example` to `.env` and fill the `VITE_FIREBASE_*` values — Firebase is the app's
> only backend.

## 1. One-time machine setup

```powershell
pwsh ./setup.ps1
```

Idempotent — safe to re-run any time. It installs (or verifies): Git, Node.js LTS, the
Claude Code CLI, uv (+ a managed Python for `.claude` tooling), just, and the GitHub CLI,
then seeds `.mcp.json` from the committed `.mcp.json.stub`. Watch for `[FAIL]`/`[WARN]`
lines; green `[OK]` all the way down means you're done.

**Close and reopen PowerShell afterwards** — PATH updates only land in new shells.

## 2. Install dependencies

```powershell
just install
```

Runs `npm ci` against the committed `package-lock.json`. Note: the `prepare` script also
downloads the Cypress binary (~first run only), so expect a few minutes.

## 3. Start the dev server

```powershell
just start        # background window
# or
just dev          # foreground, Ctrl+C to stop
```

Open **http://localhost:8115** (use `localhost` — Vite binds the IPv6 loopback `[::1]` on
Windows, so `127.0.0.1` refuses). Stop with `just stop` — it only kills node processes
whose command line contains this repo's path.

## 4. First-run verification

| Check | Expect |
| --- | --- |
| `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8115/` | `200` |
| Browser at `http://localhost:8115` | "Firebase not configured" setup banner **until** `.env` is filled (next section) |
| `just build` | exit 0; `dist/` with hashed chunks + `sw.js` (one >500 kB chunk warning is known — the Firebase SDK) |
| `just test` | runs once and exits; all 9 spec files pass (no Firebase keys needed) |

## 5. Fill the Firebase config (needed for actual app work)

1. Create a Firebase project at <https://console.firebase.google.com> with **Auth**
   (email/password), **Firestore**, and **Storage** enabled.
2. Add a Web App to the project and copy its config values.
3. Copy `.env.example` to `.env` (git-ignored) and fill each `VITE_FIREBASE_*` value.
   `VITE_FIREBASE_MEASUREMENT_ID` is optional (Analytics).
4. Restart the dev server (`just stop`, then `just start`) — the app mounts, and
   register/login/upload/play all work against your project.

A Firebase web config is not a server secret (security lives in Firebase rules), but each
dev fills their own `.env` — the file is git-ignored and must never be committed.

## 6. IDE setup (from the original scaffold README)

[VSCode](https://code.visualstudio.com/) + the
[Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
extension — and disable Vetur if you have it. `jsconfig.json` maps `@/*` to `src/*` so
imports resolve in the editor.

## Related docs

| Doc | Why |
| --- | --- |
| [`../06-troubleshooting/common-issues.md`](../06-troubleshooting/common-issues.md) | When any step above misbehaves |
| [`../03-development/workflow.md`](../03-development/workflow.md) | What to do after it runs |
| [`../05-reference/commands.md`](../05-reference/commands.md) | All recipes at a glance |
