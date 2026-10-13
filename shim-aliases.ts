// Maps Next.js/Firebase imports in the ported code to local shims (see AGENTS.md).
import { fileURLToPath } from "node:url";

const shim = (f: string) => fileURLToPath(new URL(`./src/shims/${f}`, import.meta.url));

export const shimAliases = [
  { find: /^next\/link$/, replacement: shim("next-link.tsx") },
  { find: /^next\/navigation$/, replacement: shim("next-navigation.ts") },
  { find: /^next\/image$/, replacement: shim("next-misc.tsx") },
  { find: /^next\/script$/, replacement: shim("next-script.tsx") },
  { find: /^next\/server$/, replacement: shim("next-server.ts") },
  { find: /^next$/, replacement: shim("next-misc.tsx") },
  { find: /^next-themes$/, replacement: shim("next-themes.tsx") },
  { find: /^firebase\/firestore$/, replacement: shim("firebase-firestore.ts") },
  { find: /^firebase\/auth$/, replacement: shim("firebase-auth.ts") },
  { find: /^firebase\/(app|storage)$/, replacement: shim("firebase-misc.ts") },
];
