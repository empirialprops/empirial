// Local stand-in for the Firestore SDK: data lives in the browser (localStorage),
// seeded from the site's built-in datasets. Lets the original pages run unchanged.
import { MOCK_FIRMS } from "@/lib/data/firms-data";
import { MOCK_CHALLENGES } from "@/lib/data/challenges-data";
import { MOCK_DEALS } from "@/lib/data/deals-data";
import { MOCK_REVIEWS } from "@/lib/data/reviews-data";
import { MOCK_EVENTS } from "@/lib/data/events-data";
import { MOCK_BLOG_POSTS } from "@/lib/data/blog-data";
import { MOCK_PAYOUTS } from "@/lib/data/payouts-data";
import { MOCK_AWARDS } from "@/lib/data/awards-data";
import { MOCK_SPREADS } from "@/lib/data/spreads-data";
import { MOCK_POSTS } from "@/lib/data/community-data";
import { MOCK_REWARDS } from "@/lib/data/loyalty-data";
import { MOCK_TICKERS, PARTNER_LOGOS, TESTIMONIALS, PRICING_PLANS, FAQ_ITEMS } from "@/lib/data/site-data";

type Doc = Record<string, any>;
type Store = Record<string, Record<string, Doc>>;

const SEEDS: Record<string, any[]> = {
  firms: MOCK_FIRMS,
  challenges: MOCK_CHALLENGES,
  deals: MOCK_DEALS,
  reviews: MOCK_REVIEWS,
  events: MOCK_EVENTS,
  blogPosts: MOCK_BLOG_POSTS,
  payouts: MOCK_PAYOUTS,
  awards: MOCK_AWARDS,
  brokerSpreads: MOCK_SPREADS,
  communityPosts: MOCK_POSTS,
  loyaltyRewards: MOCK_REWARDS,
  marketTickers: MOCK_TICKERS.map((t: any) => ({ id: t.symbol, ...t })),
  partnerLogos: PARTNER_LOGOS,
  testimonials: TESTIMONIALS,
  pricingPlans: PRICING_PLANS,
  faqs: FAQ_ITEMS,
};

const KEY = "empirial_local_db_v1";
let store: Store | null = null;
const listeners = new Set<() => void>();

function seed(): Store {
  const s: Store = {};
  for (const [name, rows] of Object.entries(SEEDS)) {
    s[name] = {};
    rows.forEach((r: any, i: number) => {
      const id = String(r?.id ?? `${name}-${i}`);
      s[name][id] = { ...r, id };
    });
  }
  return s;
}

function getStore(): Store {
  if (store) return store;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return (store = JSON.parse(raw));
    } catch {}
  }
  store = seed();
  return store;
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {}
  }
  queueMicrotask(() => listeners.forEach((l) => l()));
}

function col(name: string) {
  const s = getStore();
  return (s[name] ??= {});
}

let counter = 0;
const newId = () => Date.now().toString(36) + (counter++).toString(36) + Math.random().toString(36).slice(2, 7);

// ---- refs ----
export type Firestore = { __db: true };
export type DocumentData = Doc;
export class Timestamp {
  constructor(public seconds: number, public nanoseconds = 0) {}
  static now() { return new Timestamp(Math.floor(Date.now() / 1000)); }
  static fromDate(d: Date) { return new Timestamp(Math.floor(d.getTime() / 1000)); }
  toDate() { return new Date(this.seconds * 1000); }
  toMillis() { return this.seconds * 1000; }
}

class CollectionRef { type = "collection" as const; constructor(public path: string) {} get id() { return this.path.split("/").pop()!; } }
class DocRef { type = "document" as const; constructor(public path: string) {} get id() { return this.path.split("/").pop()!; } get parent() { return new CollectionRef(this.path.split("/").slice(0, -1).join("/")); } }
type Constraint = { kind: "where" | "orderBy" | "limit"; a?: any; b?: any; c?: any };
class Query { type = "query" as const; constructor(public ref: CollectionRef, public constraints: Constraint[]) {} }

export function getFirestore(..._a: any[]): Firestore { return { __db: true }; }
export function collection(_parent: any, ...segments: string[]) {
  const base = _parent instanceof DocRef ? _parent.path + "/" : "";
  return new CollectionRef(base + segments.join("/"));
}
export function doc(parent: any, ...segments: string[]) {
  if (parent instanceof CollectionRef) return new DocRef(parent.path + "/" + (segments[0] ?? newId()));
  if (parent instanceof DocRef) return new DocRef(parent.path + "/" + segments.join("/"));
  return new DocRef(segments.join("/"));
}
export const where = (a: string, b: string, c: any): Constraint => ({ kind: "where", a, b, c });
export const orderBy = (a: string, b: "asc" | "desc" = "asc"): Constraint => ({ kind: "orderBy", a, b });
export const limit = (n: number): Constraint => ({ kind: "limit", a: n });
export function query(ref: CollectionRef | Query, ...cs: Constraint[]) {
  return ref instanceof Query ? new Query(ref.ref, [...ref.constraints, ...cs]) : new Query(ref, cs);
}

// ---- field values ----
const FV = Symbol("fv");
export const increment = (n: number) => ({ [FV]: "inc", n });
export const arrayUnion = (...v: any[]) => ({ [FV]: "union", v });
export const arrayRemove = (...v: any[]) => ({ [FV]: "remove", v });
export const serverTimestamp = () => ({ [FV]: "ts" });
export const deleteField = () => ({ [FV]: "del" });

function applyFields(target: Doc, data: Doc) {
  for (const [k, v] of Object.entries(data)) {
    const parts = k.split(".");
    let t = target;
    for (const p of parts.slice(0, -1)) t = t[p] = typeof t[p] === "object" && t[p] ? t[p] : {};
    const key = parts[parts.length - 1];
    if (v && typeof v === "object" && (v as any)[FV]) {
      const f = v as any;
      if (f[FV] === "inc") t[key] = (Number(t[key]) || 0) + f.n;
      else if (f[FV] === "union") t[key] = [...(t[key] || []), ...f.v.filter((x: any) => !(t[key] || []).some((y: any) => JSON.stringify(y) === JSON.stringify(x)))];
      else if (f[FV] === "remove") t[key] = (t[key] || []).filter((y: any) => !f.v.some((x: any) => JSON.stringify(y) === JSON.stringify(x)));
      else if (f[FV] === "ts") t[key] = new Date().toISOString();
      else if (f[FV] === "del") delete t[key];
    } else t[key] = v instanceof Date ? v.toISOString() : v;
  }
}

function split(path: string) {
  const parts = path.split("/");
  return { c: parts.slice(0, -1).join("/"), id: parts[parts.length - 1] };
}

// ---- snapshots ----
function docSnap(ref: DocRef) {
  const { c, id } = split(ref.path);
  const data = col(c)[id];
  return { id, ref, exists: () => !!data, data: () => (data ? structuredClone(data) : undefined), get: (f: string) => data?.[f] };
}

function getField(d: Doc, path: string) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), d as any);
}

function runQuery(q: CollectionRef | Query) {
  const ref = q instanceof Query ? q.ref : q;
  const cs = q instanceof Query ? q.constraints : [];
  let rows = Object.entries(col(ref.path)).map(([id, d]) => ({ id, d }));
  for (const c of cs) {
    if (c.kind === "where") {
      rows = rows.filter(({ id, d }) => {
        const v = c.a === "__name__" ? id : getField(d, c.a);
        switch (c.b) {
          case "==": return v === c.c;
          case "!=": return v !== c.c;
          case ">": return v > c.c;
          case ">=": return v >= c.c;
          case "<": return v < c.c;
          case "<=": return v <= c.c;
          case "in": return (c.c as any[]).includes(v);
          case "not-in": return !(c.c as any[]).includes(v);
          case "array-contains": return Array.isArray(v) && v.includes(c.c);
          case "array-contains-any": return Array.isArray(v) && v.some((x) => c.c.includes(x));
          default: return true;
        }
      });
    }
  }
  for (const c of cs.filter((c) => c.kind === "orderBy").reverse()) {
    rows.sort((x, y) => {
      const a = getField(x.d, c.a), b = getField(y.d, c.a);
      const r = a > b ? 1 : a < b ? -1 : 0;
      return c.b === "desc" ? -r : r;
    });
  }
  const lim = cs.find((c) => c.kind === "limit");
  if (lim) rows = rows.slice(0, lim.a);
  const docs = rows.map(({ id }) => docSnap(new DocRef(ref.path + "/" + id)));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn: (d: any) => void) => docs.forEach(fn) };
}

// ---- reads / writes ----
export async function getDocs(q: any) { return runQuery(q); }
export async function getDoc(ref: DocRef) { return docSnap(ref); }
export const getDocFromServer = getDoc;
export const getCountFromServer = async (q: any) => ({ data: () => ({ count: runQuery(q).size }) });

function setSync(ref: DocRef, data: Doc, opts?: { merge?: boolean }) {
  const { c, id } = split(ref.path);
  const cur = opts?.merge ? { ...(col(c)[id] || {}) } : {};
  applyFields(cur, data);
  col(c)[id] = { ...cur, id: cur.id ?? id };
}
function updateSync(ref: DocRef, data: Doc) {
  const { c, id } = split(ref.path);
  if (!col(c)[id]) throw new Error(`No document to update: ${ref.path}`);
  applyFields(col(c)[id], data);
}
function deleteSync(ref: DocRef) {
  const { c, id } = split(ref.path);
  delete col(c)[id];
}

export async function setDoc(ref: DocRef, data: Doc, opts?: { merge?: boolean }) { setSync(ref, data, opts); persist(); }
export async function updateDoc(ref: DocRef, data: Doc) { updateSync(ref, data); persist(); }
export async function deleteDoc(ref: DocRef) { deleteSync(ref); persist(); }
export async function addDoc(c: CollectionRef, data: Doc) {
  const ref = new DocRef(c.path + "/" + newId());
  setSync(ref, data);
  persist();
  return ref;
}

export function writeBatch(_db?: any) {
  const ops: (() => void)[] = [];
  const b = {
    set: (r: DocRef, d: Doc, o?: any) => (ops.push(() => setSync(r, d, o)), b),
    update: (r: DocRef, d: Doc) => (ops.push(() => updateSync(r, d)), b),
    delete: (r: DocRef) => (ops.push(() => deleteSync(r)), b),
    commit: async () => { ops.forEach((o) => o()); persist(); },
  };
  return b;
}

export async function runTransaction<T>(_db: any, fn: (t: any) => Promise<T>) {
  const t = {
    get: async (r: DocRef) => docSnap(r),
    set: (r: DocRef, d: Doc, o?: any) => (setSync(r, d, o), t),
    update: (r: DocRef, d: Doc) => (updateSync(r, d), t),
    delete: (r: DocRef) => (deleteSync(r), t),
  };
  const res = await fn(t);
  persist();
  return res;
}

export function onSnapshot(target: any, next: any, error?: any) {
  const cb = typeof next === "function" ? next : next?.next;
  const emit = () => {
    try {
      cb?.(target instanceof DocRef ? docSnap(target) : runQuery(target));
    } catch (e) {
      error?.(e);
    }
  };
  queueMicrotask(emit);
  listeners.add(emit);
  return () => listeners.delete(emit);
}

export const enableIndexedDbPersistence = async () => {};
export const initializeFirestore = getFirestore;
