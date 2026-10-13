// Local stand-in for Firebase Auth: accounts are kept in this browser only.
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  providerData: { providerId: string }[];
  metadata: { creationTime?: string; lastSignInTime?: string };
  getIdToken: () => Promise<string>;
  reload: () => Promise<void>;
};
export type Auth = { currentUser: User | null };
export type UserCredential = { user: User; providerId?: string; _isNew?: boolean };

const USERS = "empirial_local_users";
const SESSION = "empirial_local_session";
const auth: Auth = { currentUser: null };
const subs = new Set<(u: User | null) => void>();
let loaded = false;

function hydrate(raw: any): User {
  return { ...raw, getIdToken: async () => "local-" + raw.uid, reload: async () => {} };
}
function readUsers(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(USERS) || "{}"); } catch { return {}; }
}
function writeUsers(u: Record<string, any>) { localStorage.setItem(USERS, JSON.stringify(u)); }
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const s = localStorage.getItem(SESSION);
    if (s) auth.currentUser = hydrate(JSON.parse(s));
  } catch {}
}
function setUser(u: User | null) {
  auth.currentUser = u;
  if (u) {
    const { getIdToken: _g, reload: _r, ...plain } = u;
    localStorage.setItem(SESSION, JSON.stringify(plain));
  } else localStorage.removeItem(SESSION);
  subs.forEach((f) => f(u));
}

export function getAuth(..._a: any[]) { load(); return auth; }
export function onAuthStateChanged(_a: Auth, cb: (u: User | null) => void) {
  load();
  subs.add(cb);
  queueMicrotask(() => cb(auth.currentUser));
  return () => subs.delete(cb);
}
export const onIdTokenChanged = onAuthStateChanged;

function makeUser(email: string, provider: string, name?: string): any {
  const now = new Date().toISOString();
  return {
    uid: "u_" + Math.random().toString(36).slice(2, 12),
    email,
    displayName: name ?? email.split("@")[0],
    photoURL: null,
    phoneNumber: null,
    emailVerified: provider !== "password",
    providerData: [{ providerId: provider }],
    metadata: { creationTime: now, lastSignInTime: now },
    password: undefined as string | undefined,
  };
}

export async function createUserWithEmailAndPassword(_a: Auth, email: string, password: string): Promise<UserCredential> {
  const users = readUsers();
  if (users[email.toLowerCase()]) throw Object.assign(new Error("Email already in use"), { code: "auth/email-already-in-use" });
  const u = makeUser(email, "password");
  u.password = password;
  users[email.toLowerCase()] = u;
  writeUsers(users);
  const { password: _p, ...pub } = u;
  const user = hydrate(pub);
  setUser(user);
  return { user, _isNew: true };
}

export async function signInWithEmailAndPassword(_a: Auth, email: string, password: string): Promise<UserCredential> {
  const u = readUsers()[email.toLowerCase()];
  if (!u || u.password !== password) throw Object.assign(new Error("Invalid email or password"), { code: "auth/invalid-credential" });
  const { password: _p, ...pub } = u;
  const user = hydrate(pub);
  setUser(user);
  return { user };
}

export class GoogleAuthProvider {
  providerId = "google.com";
  addScope() {}
  setCustomParameters() {}
  static credentialFromError() { return null; }
  static credentialFromResult() { return null; }
}
export class OAuthProvider {
  constructor(public providerId: string) {}
  addScope() {}
  setCustomParameters() {}
  credential(_o: any) { return { providerId: this.providerId }; }
  static credentialFromError() { return null; }
}

export async function signInWithPopup(_a: Auth, provider: { providerId: string }): Promise<UserCredential> {
  const email = window.prompt(`Demo sign-in (${provider.providerId}) — enter your email:`);
  if (!email) throw Object.assign(new Error("Popup closed"), { code: "auth/popup-closed-by-user" });
  const users = readUsers();
  const key = email.toLowerCase();
  const isNew = !users[key];
  if (isNew) { users[key] = makeUser(email, provider.providerId); writeUsers(users); }
  const { password: _p, ...pub } = users[key];
  const user = hydrate(pub);
  setUser(user);
  return { user, providerId: provider.providerId, _isNew: isNew };
}
export const signInWithRedirect = signInWithPopup;
export async function getRedirectResult() { return null; }
export async function signInWithCredential(a: Auth, c: any) { return signInWithPopup(a, c); }
export async function linkWithCredential(u: User) { return { user: u }; }
export async function signInWithCustomToken(): Promise<UserCredential> { throw new Error("Not supported in local mode"); }
export function getAdditionalUserInfo(c: UserCredential) { return { isNewUser: !!c._isNew, providerId: c.providerId ?? null, profile: {} }; }
export async function fetchSignInMethodsForEmail(_a: Auth, email: string) {
  const u = readUsers()[email.toLowerCase()];
  return u ? u.providerData.map((p: any) => p.providerId) : [];
}
export async function signOut(_a?: Auth) { setUser(null); }
export async function sendPasswordResetEmail() {}
export async function sendEmailVerification() {}
export async function updateProfile(u: User, data: { displayName?: string; photoURL?: string }) {
  Object.assign(u, data);
  if (auth.currentUser?.uid === u.uid) setUser(u);
}
export async function setPersistence() {}
export const browserLocalPersistence = {};
