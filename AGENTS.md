<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Notebook Lab Agent Guide

Before any substantial task:

1. Read [docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md) and [docs/WORKFLOW.md](docs/WORKFLOW.md).
2. Use [docs/specs/ROADMAP.md](docs/specs/ROADMAP.md) to locate the current feature and task specs.
3. Read the current `FEATURE.md` and `Txx` spec, then inspect the real code before planning.
4. Follow the external-review Git approval gate; technical PASS does not authorize Git finalization.
5. Keep work bounded. Never silently expand scope or modify unrelated user/delegation files, including `.agents/`, `.delegate/`, and `skills-lock.json`.
