# Project rules

- `src/app`, `src/components`, `src/lib` hold code ported from the original Next.js + Firebase site; routes in `src/routes` are thin wrappers that import those pages. Why: keeps the port faithful and diffable against the source repo.
- `next/*`, `next-themes` and `firebase/*` imports resolve to local shims in `src/shims` (aliased in vite.config.ts and tsconfig.json). Why: lets ported code run unchanged on TanStack Start.
- The Firestore/Auth shims store data in the browser (localStorage), seeded from `src/lib/data`. Why: interim until data and accounts move to Lovable Cloud.
- tsconfig strictness is relaxed to match the original codebase. Why: the ported code was written without strict index/optional checks.
