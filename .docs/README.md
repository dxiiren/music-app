# Music App — Developer Documentation

> **New here? Start with [`tldr.md`](tldr.md)** — every document below summarised in 30 seconds
> each, with links into the full versions.

## Who is this for?

| Reader | Start here |
| --- | --- |
| New developer, day one | [`tldr.md`](tldr.md), then [`02-setup/getting-started.md`](02-setup/getting-started.md) |
| Developer making a change | [`03-development/workflow.md`](03-development/workflow.md) |
| Someone asking "what is this app?" | [`01-overview/project-overview.md`](01-overview/project-overview.md) |
| Debugging a broken local setup | [`06-troubleshooting/common-issues.md`](06-troubleshooting/common-issues.md) |
| Looking up a command | [`05-reference/commands.md`](05-reference/commands.md) |

## Recommended reading order

1. [`tldr.md`](tldr.md) — the whole doc set at a glance.
2. [`01-overview/project-overview.md`](01-overview/project-overview.md) — what the app does.
3. [`02-setup/getting-started.md`](02-setup/getting-started.md) — get it running.
4. [`01-overview/architecture.md`](01-overview/architecture.md) — how the pieces fit.
5. [`03-development/workflow.md`](03-development/workflow.md) — day-2 development loop.
6. [`05-reference/commands.md`](05-reference/commands.md) — keep open as a cheat sheet.

## 01-overview

| Document | What it covers |
| --- | --- |
| [`project-overview.md`](01-overview/project-overview.md) | What the app is: playlist, auth, upload/manage, player, comments, PWA — and the empty-Firebase-config caveat |
| [`architecture.md`](01-overview/architecture.md) | Boot gating, component tree, Pinia stores, Firestore data model, the Howler player loop, i18n |

## 02-setup

| Document | What it covers |
| --- | --- |
| [`getting-started.md`](02-setup/getting-started.md) | setup.ps1, `just install`, `just start`, first-run verification, IDE setup, filling the Firebase config |

## 03-development

| Document | What it covers |
| --- | --- |
| [`workflow.md`](03-development/workflow.md) | Branching, the edit/verify loop, lint + format, unit tests (and their 2 pre-existing failures), Cypress e2e, commit and PR conventions |

## 04-deployment

| Document | What it covers |
| --- | --- |
| [`deployment.md`](04-deployment/deployment.md) | Honest status: no CI/CD, runs locally; what `just build` produces (PWA bundle) and what deploying would take |

## 05-reference

| Document | What it covers |
| --- | --- |
| [`commands.md`](05-reference/commands.md) | Every just recipe and npm script, with gotchas |
| [`project-layout.md`](05-reference/project-layout.md) | Annotated file tree — where everything lives and why |

## 06-troubleshooting

| Document | What it covers |
| --- | --- |
| [`common-issues.md`](06-troubleshooting/common-issues.md) | Real symptoms hit during setup/verification and their fixes |

## 07-faq

| Document | What it covers |
| --- | --- |
| [`faq.md`](07-faq/faq.md) | Short answers: ports, the empty Firebase config, failing specs, the `ms` default locale, dev-dist churn, and more |
