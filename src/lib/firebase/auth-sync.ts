// @ts-nocheck -- ported legacy code; typed loosely in the original project
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAdditionalUserInfo,
  UserCredential,
  fetchSignInMethodsForEmail,
  signInWithCredential,
  linkWithCredential,
  User,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthSyncResult {
  user: User;
  isNewUser: boolean;
  provider: 'google.com' | 'discord.com' | 'password';
  needsPhonePrompt: boolean;
}

/**
 * Configure Google Auth Provider
 */
export function getGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

/**
 * Configure Discord OAuth Provider
 */
export function getDiscordProvider(): OAuthProvider {
  const provider = new OAuthProvider('discord.com');
  provider.addScope('identify');
  provider.addScope('email');
  provider.setCustomParameters({ prompt: 'consent' });
  return provider;
}

/**
 * Sign In / Sign Up with Google
 */
export async function loginWithGoogle(): Promise<AuthSyncResult> {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const provider = getGoogleProvider();

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(result);
    const isNewUser = !!additionalInfo?.isNewUser;
    const phone = result.user.phoneNumber || '';

    // Save/Update in Firestore
    await upsertUserFirestore(result.user, 'google.com', isNewUser);

    return {
      user: result.user,
      isNewUser,
      provider: 'google.com',
      needsPhonePrompt: isNewUser && !phone,
    };
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      return handleOAuthCollision(error, provider);
    }
    throw error;
  }
}

/**
 * Sign In / Sign Up with Discord
 */
export async function loginWithDiscord(): Promise<AuthSyncResult> {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const provider = getDiscordProvider();

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(result);
    const isNewUser = !!additionalInfo?.isNewUser;
    const phone = result.user.phoneNumber || '';

    // Save/Update in Firestore
    await upsertUserFirestore(result.user, 'discord.com', isNewUser);

    return {
      user: result.user,
      isNewUser,
      provider: 'discord.com',
      needsPhonePrompt: isNewUser && !phone,
    };
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      return handleOAuthCollision(error, provider);
    }
    throw error;
  }
}

/**
 * Sign Up with Email and Password
 */
export async function signupWithEmailPassword(
  email: string,
  pass: string,
  fullName: string,
  phone?: string
): Promise<AuthSyncResult> {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const result = await createUserWithEmailAndPassword(auth, email, pass);

  // Update in Firestore
  await upsertUserFirestore(result.user, 'password', true, {
    displayName: fullName,
    phoneNumber: phone || '',
  });

  // Immediately dispatch to Google Sheet
  await dispatchUserToSheet({
    uid: result.user.uid,
    name: fullName || email.split('@')[0],
    email: result.user.email || email,
    phone: phone || 'N/A',
    provider: 'password',
    createdAt: result.user.metadata.creationTime || new Date().toISOString(),
  });

  return {
    user: result.user,
    isNewUser: true,
    provider: 'password',
    needsPhonePrompt: !phone,
  };
}

/**
 * Sign In with existing Email and Password
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<AuthSyncResult> {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await upsertUserFirestore(result.user, 'password', false);

  return {
    user: result.user,
    isNewUser: false,
    provider: 'password',
    needsPhonePrompt: false,
  };
}

/**
 * Upsert User into Firestore
 */
async function upsertUserFirestore(
  user: User,
  provider: string,
  isNewUser: boolean,
  extraData?: { displayName?: string; phoneNumber?: string }
) {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    const dataToSave: any = {
      uid: user.uid,
      email: user.email || '',
      displayName: extraData?.displayName || user.displayName || user.email?.split('@')[0] || 'Trader',
      phoneNumber: extraData?.phoneNumber || user.phoneNumber || snap.data()?.phoneNumber || '',
      photoURL: user.photoURL || '',
      provider: provider,
      lastLogin: serverTimestamp(),
    };

    if (!snap.exists() || isNewUser) {
      dataToSave.createdAt = serverTimestamp();
      dataToSave.role = user.email?.includes('admin') ? 'admin' : 'trader';
      dataToSave.points = 500;
    }

    await setDoc(userRef, dataToSave, { merge: true });
  } catch (err) {
    console.warn('[Firestore User Upsert Warning]:', err);
  }
}

/**
 * Handle OAuth Account Collision (Linking existing email to new OAuth credential)
 */
async function handleOAuthCollision(error: any, pendingProvider: any): Promise<AuthSyncResult> {
  const pendingCred = OAuthProvider.credentialFromError(error);
  const email = error.customData?.email;

  if (!email || !auth) {
    throw error;
  }

  // 1. Fetch available sign-in methods for this email
  const methods = await fetchSignInMethodsForEmail(auth, email);

  if (methods.includes('google.com')) {
    // Authenticate with Google first
    const googleResult = await signInWithPopup(auth, getGoogleProvider());
    if (pendingCred) {
      await linkWithCredential(googleResult.user, pendingCred);
    }
    return {
      user: googleResult.user,
      isNewUser: false,
      provider: 'google.com',
      needsPhonePrompt: false,
    };
  }

  throw new Error(`An account already exists with ${email} using ${methods.join(', ')}. Please log in with your primary provider.`);
}

/**
 * Dispatch user signup payload to Backend API route `/api/auth/sync-sheet`
 * (with fallback to direct Google Apps Script Webhook).
 */
export async function dispatchUserToSheet(payload: {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  provider: string;
  createdAt?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Try secure Next.js API Route first
    const res = await fetch('/api/auth/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log('[Sheets Sync] Successfully synced user via /api/auth/sync-sheet:', payload.email);
      return { success: true };
    }

    // 2. Fallback to client-side direct webhook if API route fails or env not on server
    const directWebhook =
      (import.meta.env.VITE_UNUSED as string | undefined) ||
      (typeof window !== 'undefined' ? localStorage.getItem('empirial_sheets_webhook_url') : '');

    if (directWebhook) {
      await fetch(directWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
      console.log('[Sheets Sync Fallback] Dispatched directly to Apps Script:', payload.email);
      return { success: true };
    }

    return { success: false, error: 'Webhook URL not configured' };
  } catch (err: any) {
    console.error('[Sheets Sync Dispatch Error]:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
