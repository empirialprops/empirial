# Roadmap

- [x] Fix build error: `@/app/admin/logs/page` (stale cache — build-errors.log now clear)
- [ ] Wire real Firebase (user wants to keep Firebase, not Lovable Cloud)
  - BLOCKED: need user's Firebase web app config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
  - Then: replace src/shims/firebase-* with real firebase client SDK (Firestore + Auth)
  - Note: server-side Firebase admin features (sheet sync) not possible client-side
