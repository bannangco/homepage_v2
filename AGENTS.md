# Repository guidelines

- Use Node.js 24 from `.node-version` and install the lockfile exactly with `npm ci`.
- Keep Next.js as a static export to `out/`; do not add a server runtime, API, database, CMS, OpenNext, or image optimizer dependency.
- Run checks in this order: `node --version`, `npm --version`, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --omit=dev --audit-level=high`, `npm run build`, `npm run check:static`, `npm run check:cloudflare`, `npm audit`, `git diff --check`, and `git status --short`. Run `npm run check:production` when production assurance is in scope.
- `npm run check:cloudflare` is credential-free dry-run validation. Never run `npm run deploy:cloudflare` or mutate Cloudflare, DNS, redirects, SSL/TLS, or custom domains without explicit authorization.
- Keep `npm run check:production` pinned to `https://bannangco.com`; staging checks require a reviewed source allowlist change, never a CLI or environment target override.
- Do not invent service, legal, privacy, financial, tax, corporate, or personal facts. Keep `data/announcements.json` and `data/legal-documents.json` empty until authoritative, publication-approved records are supplied.
- Never publish a PDF without an explicit privacy review and approval. Do not derive legal dates or metadata from filenames, timestamps, or guesses.
- Preserve mobile layout, keyboard access, reduced-motion behavior, no-JavaScript content, and static-export checks for public UI changes.
- Preserve unrelated user changes. Do not reset, rebase, force-push, deploy, merge, or mutate external systems unless explicitly authorized.
- Finish implementation work on a focused branch with a clean worktree and a Draft PR unless the user requests a different delivery flow.
- Follow the detailed production procedures in [`docs/production-operations.md`](docs/production-operations.md).
