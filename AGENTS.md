# Project rules

- `src/app`, `src/components`, `src/lib` hold code ported from the original Next.js + Firebase site; routes in `src/routes` are thin wrappers that import those pages. Why: keeps the port faithful and diffable against the source repo.
- `next/*` and `next-themes` imports resolve to local shims in `src/shims` (aliased via shim-aliases.ts); `firebase/*` uses the real Firebase SDK. Why: lets ported code run unchanged on TanStack Start while using the live Firebase backend.
- tsconfig strictness is relaxed to match the original codebase. Why: the ported code was written without strict index/optional checks.
