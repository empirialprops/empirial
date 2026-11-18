'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
  enabled: boolean;
}

export interface SocialLinksConfig {
  discordUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  linkedinUrl: string;
  customLinks: CustomSocialLink[];
  updatedAt: number;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  discordUrl: 'https://discord.gg/ww4dkeeZdp',
  twitterUrl: 'https://x.com/anuraj_fx',
  telegramUrl: 'https://t.me/empirialprops',
  youtubeUrl: 'https://www.youtube.com/@jaat_anuraj_fx',
  instagramUrl: 'https://www.instagram.com/anuraj_fx',
  whatsappUrl: '',
  linkedinUrl: '',
  customLinks: [],
  updatedAt: 1,
};

const STORAGE_KEY = 'empirial_social_links';

export function getStoredSocialLinks(): SocialLinksConfig {
  if (typeof window === 'undefined') return DEFAULT_SOCIAL_LINKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SOCIAL_LINKS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SOCIAL_LINKS,
      ...parsed,
      customLinks: Array.isArray(parsed.customLinks) ? parsed.customLinks : [],
    };
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}

export async function saveStoredSocialLinks(config: SocialLinksConfig): Promise<void> {
  const updated: SocialLinksConfig = {
    ...config,
    updatedAt: Date.now(),
  };

  // 1. Instant local persistence & reactive broadcast across all tabs/components
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('empirial-socials-updated', { detail: updated }));
    } catch (err) {
      console.warn('Failed to save social links to localStorage:', err);
    }
  }

  // 2. Non-blocking Firestore persistence to siteSettings
  if (db) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500)
      );

      const firestorePayload = {
        discordUrl: updated.discordUrl,
        twitterUrl: updated.twitterUrl,
        xUrl: updated.twitterUrl,
        telegramUrl: updated.telegramUrl,
        youtubeUrl: updated.youtubeUrl,
        instagramUrl: updated.instagramUrl,
        whatsappUrl: updated.whatsappUrl,
        linkedinUrl: updated.linkedinUrl,
        customSocialLinks: updated.customLinks,
        updatedAt: updated.updatedAt,
      };

      // Save to both siteSettings/socials and siteSettings/general for legacy compatibility
      const savePromise = Promise.all([
        setDoc(doc(db, 'siteSettings', 'socials'), firestorePayload, { merge: true }),
        setDoc(doc(db, 'siteSettings', 'general'), firestorePayload, { merge: true }),
      ]);

      await Promise.race([savePromise, timeoutPromise]).catch((e) => {
        console.warn('Remote Firestore social sync timed out or failed (offline safe):', e);
      });
    } catch (err) {
      console.warn('Failed to sync social links to Firestore:', err);
    }
  }
}

export async function fetchRemoteSocialLinks(): Promise<SocialLinksConfig> {
  const local = getStoredSocialLinks();
  if (!db) return local;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );

    const docPromise = getDoc(doc(db, 'siteSettings', 'socials'));
    const snap = await Promise.race([docPromise, timeoutPromise]);

    if (snap.exists()) {
      const data = snap.data();
      const remoteConfig: SocialLinksConfig = {
        discordUrl: data.discordUrl || local.discordUrl,
        twitterUrl: data.twitterUrl || data.xUrl || local.twitterUrl,
        telegramUrl: data.telegramUrl || local.telegramUrl,
        youtubeUrl: data.youtubeUrl || local.youtubeUrl,
        instagramUrl: data.instagramUrl || local.instagramUrl,
        whatsappUrl: data.whatsappUrl || local.whatsappUrl,
        linkedinUrl: data.linkedinUrl || local.linkedinUrl,
        customLinks: Array.isArray(data.customSocialLinks) ? data.customSocialLinks : local.customLinks,
        updatedAt: data.updatedAt || local.updatedAt,
      };

      if (remoteConfig.updatedAt > local.updatedAt) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConfig));
          window.dispatchEvent(new CustomEvent('empirial-socials-updated', { detail: remoteConfig }));
        }
        return remoteConfig;
      }
    }
  } catch {
    // Return local on timeout / offline
  }

  return local;
}

