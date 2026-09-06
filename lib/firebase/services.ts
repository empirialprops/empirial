import { db, storage } from './config';
import type { UserProfile } from '../utils/auth-store';
import { getStoredDeals, saveStoredDeals, sortDeals } from '../utils/deals-store';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  writeBatch,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  Firm, 
  Challenge, 
  Deal, 
  Payout, 
  BrokerSpread, 
  Event, 
  Award, 
  CommunityPost, 
  Review, 
  LoyaltyReward, 
  MarketTicker, 
  BlogPost 
} from '../types';

import { MOCK_EVENTS } from '../data/events-data';
import { MOCK_DEALS } from '../data/deals-data';

// Helper to convert Firestore Snapshot to Array of items
const mapSnapshot = <T>(snapshot: any): T[] => {
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
};

// Helper to recursively strip undefined properties from objects and arrays so Firestore setDoc/updateDoc doesn't throw unsupported undefined errors
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return undefined as any;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data;

  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as any;
  }

  const clean: any = {};
  for (const key of Object.keys(data as any)) {
    const val = (data as any)[key];
    if (val !== undefined) {
      const sanitizedVal = sanitizeForFirestore(val);
      if (sanitizedVal !== undefined) {
        clean[key] = sanitizedVal;
      }
    }
  }
  return clean as T;
}

// ==========================================
// MEDIA & FILE UPLOADS
// ==========================================
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!storage) throw new Error('Storage is not initialized');
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(fileUrl: string): Promise<void> {
  if (!storage) throw new Error('Storage is not initialized');
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image from Storage:', error);
  }
}

// ==========================================
// SITE SETTINGS
// ==========================================

// Module-level cache: all components share one single Firestore fetch.
// This eliminates the repeated per-component network delay.
let _siteSettingsCache: Promise<any> | null = null;

export function getSiteSettings(): Promise<any> {
  if (!db) return Promise.resolve(null);
  if (!_siteSettingsCache) {
    const docRef = doc(db, 'siteSettings', 'main');
    _siteSettingsCache = getDoc(docRef).then(snap => snap.exists() ? snap.data() : null);
  }
  return _siteSettingsCache;
}

/** Call this to force-refresh the cache (e.g. after admin saves settings) */
export function invalidateSiteSettingsCache() {
  _siteSettingsCache = null;
}

export async function updateSiteSettings(data: any): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'siteSettings', 'main');
  await setDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  }, { merge: true });
}

// ==========================================
// PROP FIRMS
// ==========================================
export async function getFirms(): Promise<Firm[]> {
  if (!db) return [];
  const colRef = collection(db, 'firms');
  const snap = await getDocs(query(colRef, orderBy('name')));
  return mapSnapshot<Firm>(snap);
}

export async function getFirmBySlug(slug: string): Promise<Firm | null> {
  if (!db) return null;
  const colRef = collection(db, 'firms');
  const q = query(colRef, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Firm);
}

export async function createFirm(firm: Omit<Firm, 'id'> & { id?: string }): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const id = firm.id || firm.name.toLowerCase().replace(/\s+/g, '-');
  const docRef = doc(db, 'firms', id);
  await setDoc(docRef, {
    ...firm,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return id;
}

export async function updateFirm(id: string, firm: Partial<Firm>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'firms', id);
  await updateDoc(docRef, {
    ...firm,
    updated_at: new Date().toISOString()
  });

  // Cascade denormalized data updates to challenges, deals, and payouts
  if (firm.name || firm.logo_url || firm.slug) {
    const batch = writeBatch(db);
    
    // Updates challenges
    const challsSnap = await getDocs(query(collection(db, 'challenges'), where('firm_id', '==', id)));
    challsSnap.forEach((challDoc) => {
      const updates: any = {};
      if (firm.name) updates.firm_name = firm.name;
      if (firm.logo_url) updates.firm_logo = firm.logo_url;
      if (firm.slug) updates.firm_slug = firm.slug;
      batch.update(challDoc.ref, updates);
    });

    // Updates deals
    const dealsSnap = await getDocs(query(collection(db, 'deals'), where('firm_id', '==', id)));
    dealsSnap.forEach((dealDoc) => {
      const updates: any = {};
      if (firm.name) updates.firm_name = firm.name;
      if (firm.logo_url) updates.firm_logo = firm.logo_url;
      if (firm.slug) updates.firm_slug = firm.slug;
      batch.update(dealDoc.ref, updates);
    });

    await batch.commit();
  }
}

export async function deleteFirm(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'firms', id));
  
  // Cascade delete challenges and deals
  const batch = writeBatch(db);
  const challsSnap = await getDocs(query(collection(db, 'challenges'), where('firm_id', '==', id)));
  challsSnap.forEach(d => batch.delete(d.ref));
  const dealsSnap = await getDocs(query(collection(db, 'deals'), where('firm_id', '==', id)));
  dealsSnap.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ==========================================
// EVALUATION CHALLENGES
// ==========================================
export async function getChallenges(): Promise<Challenge[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, 'challenges');
    const snap = await getDocs(colRef);
    const list = mapSnapshot<Challenge>(snap);
    return list.sort((a, b) => (a.price || 0) - (b.price || 0));
  } catch (err) {
    console.error('Failed to fetch challenges from Firestore:', err);
    return [];
  }
}

export async function getChallengesByFirm(firmId: string): Promise<Challenge[]> {
  if (!db) return [];
  const colRef = collection(db, 'challenges');
  const snap = await getDocs(query(colRef, where('firm_id', '==', firmId)));
  return mapSnapshot<Challenge>(snap);
}

export async function getDealsByFirm(firmId: string): Promise<Deal[]> {
  if (!db) return [];
  const colRef = collection(db, 'deals');
  const snap = await getDocs(query(colRef, where('firm_id', '==', firmId)));
  return mapSnapshot<Deal>(snap);
}

export async function getReviewsByFirm(firmId: string): Promise<Review[]> {
  if (!db) return [];
  const colRef = collection(db, 'reviews');
  const snap = await getDocs(query(colRef, where('firm_id', '==', firmId)));
  return mapSnapshot<Review>(snap);
}

export async function getPayoutsByFirm(firmId: string): Promise<Payout[]> {
  if (!db) return [];
  const colRef = collection(db, 'payouts');
  const snap = await getDocs(query(colRef, where('firm_id', '==', firmId)));
  return mapSnapshot<Payout>(snap);
}

export async function createChallenge(challenge: Omit<Challenge, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'challenges'));
  await setDoc(docRef, {
    ...challenge,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateChallenge(id: string, challenge: Partial<Challenge>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'challenges', id);
  await updateDoc(docRef, {
    ...challenge,
    updated_at: new Date().toISOString()
  });
}

export async function deleteChallenge(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'challenges', id));
}

// ==========================================
// DISCOUNT DEALS
// ==========================================
export async function getDeals(): Promise<Deal[]> {
  const isInit = typeof window !== 'undefined' ? localStorage.getItem('empirial_deals_initialized') : null;
  const localDeals = typeof window !== 'undefined' ? getStoredDeals() : [];

  if (!db) return localDeals;
  try {
    const colRef = collection(db, 'deals');
    const snap = await getDocs(colRef);
    const firestoreDeals = mapSnapshot<Deal>(snap);

    if (firestoreDeals && firestoreDeals.length > 0) {
      const sorted = sortDeals(firestoreDeals);
      if (typeof window !== 'undefined') {
        saveStoredDeals(sorted);
      }
      return sorted;
    }

    if (isInit === 'true') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('empirial_deals_list', JSON.stringify([]));
      }
      return [];
    }

    // First time load: Seed MOCK_DEALS into Firestore and localStorage
    if (typeof window !== 'undefined') {
      saveStoredDeals(MOCK_DEALS);
    }

    try {
      for (const deal of MOCK_DEALS) {
        const sanitized = sanitizeForFirestore(deal);
        await setDoc(doc(db, 'deals', deal.id), sanitized);
      }
    } catch (err) {
      console.warn('Seeding mock deals to Firestore failed:', err);
    }

    return MOCK_DEALS;
  } catch (err) {
    console.error('Error fetching deals from Firestore:', err);
    return localDeals;
  }
}

export async function createDeal(deal: Omit<Deal, 'id'>): Promise<string> {
  const generatedId = `deal-${Date.now()}`;
  const fullDeal: Deal = {
    ...deal,
    id: generatedId,
    created_at: deal.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const sanitized = sanitizeForFirestore(fullDeal);

  if (db) {
    try {
      const docRef = doc(db, 'deals', generatedId);
      await setDoc(docRef, sanitized);
      return generatedId;
    } catch (err) {
      console.error('Error creating deal in Firestore:', err);
    }
  }
  return generatedId;
}

export async function updateDeal(id: string, deal: Partial<Deal>): Promise<void> {
  const sanitized = sanitizeForFirestore({
    ...deal,
    updated_at: new Date().toISOString()
  });

  if (db) {
    try {
      const docRef = doc(db, 'deals', id);
      await updateDoc(docRef, sanitized);
    } catch (err) {
      console.error('Error updating deal in Firestore:', err);
    }
  }
}

export async function deleteDeal(id: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'deals', id));
  } catch (err) {
    console.error('Error deleting deal from Firestore:', err);
  }
}

export async function incrementDealClicks(id: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'deals', id);
  await updateDoc(docRef, {
    clicks_count: increment(1)
  });
}

// ==========================================
// PAYOUT PROOFS
// ==========================================
export async function getPayouts(): Promise<Payout[]> {
  if (!db) return [];
  const colRef = collection(db, 'payouts');
  const snap = await getDocs(query(colRef, orderBy('payout_date', 'desc')));
  return mapSnapshot<Payout>(snap);
}

export async function createPayout(payout: Omit<Payout, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'payouts'));
  await setDoc(docRef, {
    ...payout,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updatePayout(id: string, payout: Partial<Payout>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'payouts', id);
  await updateDoc(docRef, {
    ...payout,
    updated_at: new Date().toISOString()
  });
}

export async function deletePayout(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'payouts', id));
}

// ==========================================
// REVIEWS
// ==========================================
export async function getReviews(): Promise<Review[]> {
  if (!db) return [];
  const colRef = collection(db, 'reviews');
  const snap = await getDocs(query(colRef, orderBy('created_at', 'desc')));
  return mapSnapshot<Review>(snap);
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'reviews'));
  await setDoc(docRef, {
    ...review,
    id: docRef.id,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateReview(id: string, review: Partial<Review>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'reviews', id);
  await updateDoc(docRef, {
    ...review,
    updated_at: new Date().toISOString()
  });
}

export async function deleteReview(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'reviews', id));
}

export async function incrementReviewUpvotes(id: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'reviews', id);
  await updateDoc(docRef, {
    upvotes: increment(1)
  });
}

// ==========================================
// TOURNAMENTS & EVENTS
// ==========================================
export async function getEvents(): Promise<Event[]> {
  const isInitialized = typeof window !== 'undefined' ? localStorage.getItem('empirial_events_initialized') : null;
  const cachedData = typeof window !== 'undefined' ? localStorage.getItem('empirial_events_cache') : null;

  if (!db) {
    if (cachedData) {
      try { return JSON.parse(cachedData); } catch (_) {}
    }
    return isInitialized === 'true' ? [] : MOCK_EVENTS;
  }

  try {
    const colRef = collection(db, 'events');
    const snap = await getDocs(query(colRef, orderBy('start_date', 'asc')));
    const firebaseEvents = mapSnapshot<Event>(snap);

    if (firebaseEvents.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('empirial_events_initialized', 'true');
        localStorage.setItem('empirial_events_cache', JSON.stringify(firebaseEvents));
      }
      return firebaseEvents;
    }

    if (isInitialized === 'true') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('empirial_events_cache', JSON.stringify([]));
      }
      return [];
    }

    // First time load: seed MOCK_EVENTS into Firestore and localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('empirial_events_initialized', 'true');
      localStorage.setItem('empirial_events_cache', JSON.stringify(MOCK_EVENTS));
    }

    try {
      for (const ev of MOCK_EVENTS) {
        await setDoc(doc(db, 'events', ev.id), ev);
      }
    } catch (err) {
      console.warn('Seeding mock events to Firestore failed:', err);
    }

    return MOCK_EVENTS;
  } catch (err) {
    console.error('Failed to get events from Firestore:', err);
    if (cachedData) {
      try { return JSON.parse(cachedData); } catch (_) {}
    }
    return isInitialized === 'true' ? [] : MOCK_EVENTS;
  }
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<string> {
  const generatedId = `evt-${Date.now()}`;
  const fullEvent: Event = {
    ...event,
    id: generatedId,
    created_at: event.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const sanitizedEvent = sanitizeForFirestore(fullEvent);

  if (typeof window !== 'undefined') {
    localStorage.setItem('empirial_events_initialized', 'true');
    const existing = localStorage.getItem('empirial_events_cache');
    let list: Event[] = [];
    if (existing) {
      try { list = JSON.parse(existing); } catch (_) {}
    }
    list = [sanitizedEvent, ...list];
    localStorage.setItem('empirial_events_cache', JSON.stringify(list));
  }

  if (db) {
    try {
      const docRef = doc(db, 'events', generatedId);
      await setDoc(docRef, sanitizedEvent);
      return generatedId;
    } catch (err) {
      console.error('Failed to create event in Firestore:', err);
    }
  }

  return generatedId;
}

export async function updateEvent(id: string, event: Partial<Event>): Promise<void> {
  const sanitized = sanitizeForFirestore({
    ...event,
    updated_at: new Date().toISOString()
  });

  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('empirial_events_cache');
    if (existing) {
      try {
        let list: Event[] = JSON.parse(existing);
        list = list.map((ev) => (ev.id === id ? { ...ev, ...sanitized } : ev));
        localStorage.setItem('empirial_events_cache', JSON.stringify(list));
      } catch (_) {}
    }
  }

  if (!db) return;
  try {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, sanitized);
  } catch (err) {
    console.error('Failed to update event in Firestore:', err);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('empirial_events_initialized', 'true');
    const existing = localStorage.getItem('empirial_events_cache');
    if (existing) {
      try {
        let list: Event[] = JSON.parse(existing);
        list = list.filter((ev) => ev.id !== id);
        localStorage.setItem('empirial_events_cache', JSON.stringify(list));
      } catch (_) {}
    }
  }

  if (!db) return;
  try {
    await deleteDoc(doc(db, 'events', id));
  } catch (err) {
    console.error('Failed to delete event from Firestore:', err);
  }
}

// ==========================================
// BLOG POSTS
// ==========================================
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!db) return [];
  const colRef = collection(db, 'blogPosts');
  const snap = await getDocs(query(colRef, orderBy('published_at', 'desc')));
  return mapSnapshot<BlogPost>(snap);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!db) return null;
  const colRef = collection(db, 'blogPosts');
  const q = query(colRef, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost);
}

export async function createBlogPost(post: Omit<BlogPost, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'blogPosts'));
  await setDoc(docRef, {
    ...post,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'blogPosts', id);
  await updateDoc(docRef, {
    ...post,
    updated_at: new Date().toISOString()
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'blogPosts', id));
}

// ==========================================
// LOYALTY REWARDS
// ==========================================
export async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  if (!db) return [];
  const colRef = collection(db, 'loyaltyRewards');
  const snap = await getDocs(query(colRef, orderBy('points_cost', 'asc')));
  return mapSnapshot<LoyaltyReward>(snap);
}

export async function createLoyaltyReward(reward: Omit<LoyaltyReward, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'loyaltyRewards'));
  await setDoc(docRef, {
    ...reward,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateLoyaltyReward(id: string, reward: Partial<LoyaltyReward>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'loyaltyRewards', id);
  await updateDoc(docRef, {
    ...reward,
    updated_at: new Date().toISOString()
  });
}

export async function deleteLoyaltyReward(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'loyaltyRewards', id));
}

// ==========================================
// BROKER SPREADS
// ==========================================
export async function getBrokerSpreads(): Promise<BrokerSpread[]> {
  if (!db) return [];
  const colRef = collection(db, 'brokerSpreads');
  const snap = await getDocs(colRef);
  return mapSnapshot<BrokerSpread>(snap);
}

export async function createBrokerSpread(spread: Omit<BrokerSpread, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'brokerSpreads'));
  await setDoc(docRef, {
    ...spread,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateBrokerSpread(id: string, spread: Partial<BrokerSpread>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'brokerSpreads', id);
  await updateDoc(docRef, {
    ...spread,
    updated_at: new Date().toISOString()
  });
}

export async function deleteBrokerSpread(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'brokerSpreads', id));
}

// ==========================================
// INDUSTRY AWARDS
// ==========================================
export async function getAwards(): Promise<Award[]> {
  if (!db) return [];
  const colRef = collection(db, 'awards');
  const snap = await getDocs(query(colRef, orderBy('year', 'desc')));
  return mapSnapshot<Award>(snap);
}

export async function createAward(award: Omit<Award, 'id'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'awards'));
  await setDoc(docRef, {
    ...award,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateAward(id: string, award: Partial<Award>): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'awards', id);
  await updateDoc(docRef, {
    ...award,
    updated_at: new Date().toISOString()
  });
}

export async function deleteAward(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'awards', id));
}

export async function submitAwardVote(awardId: string, firmId: string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'awards', awardId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  
  const awardData = snap.data() as Award;
  const nominees = awardData.nominated_firms.map(n => {
    if (n.firm_id === firmId) {
      return { ...n, votes: n.votes + 1 };
    }
    return n;
  });

  await updateDoc(docRef, {
    nominated_firms: nominees,
    updated_at: new Date().toISOString()
  });
}

// ==========================================
// MARKET TICKERS
// ==========================================
export async function getMarketTickers(): Promise<MarketTicker[]> {
  if (!db) return [];
  const colRef = collection(db, 'marketTickers');
  const snap = await getDocs(colRef);
  return mapSnapshot<MarketTicker>(snap);
}

export async function updateMarketTicker(symbol: string, data: Partial<MarketTicker>): Promise<void> {
  if (!db) return;
  const id = symbol.replace('/', '-');
  const docRef = doc(db, 'marketTickers', id);
  await updateDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
}

// ==========================================
// COMMUNITY FORUM POSTS
// ==========================================
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  if (!db) return [];
  const colRef = collection(db, 'communityPosts');
  const snap = await getDocs(query(colRef, orderBy('created_at', 'desc')));
  return mapSnapshot<CommunityPost>(snap);
}

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'created_at'>): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(collection(db, 'communityPosts'));
  await setDoc(docRef, {
    ...post,
    id: docRef.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  });
  return docRef.id;
}

export async function addCommunityComment(postId: string, comment: any): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'communityPosts', postId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  
  const post = snap.data() as CommunityPost;
  const comments = post.comments || [];
  const newComment = {
    id: `comment_${Date.now()}`,
    ...comment,
    created_at: new Date().toISOString().split('T')[0],
    upvotes: 0
  };
  
  await updateDoc(docRef, {
    comments: [...comments, newComment],
    comments_count: increment(1),
    updated_at: new Date().toISOString()
  });
}

export async function deleteCommunityPost(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'communityPosts', id));
}

// ==========================
// MOCK PROFILE MIGRATION ASSISTANTS
// ==========================
export async function verifyAdminUser(uid: string): Promise<boolean> {
  if (!db) return false;
  const docRef = doc(db, 'admins', uid);
  const snap = await getDoc(docRef);
  return snap.exists() && snap.data().is_active === true;
}

export async function getPartnerLogos(): Promise<any[]> {
  if (!db) return [];
  const colRef = collection(db, 'partnerLogos');
  const snap = await getDocs(colRef);
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function savePartnerLogos(logos: any[]): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  const colRef = collection(db, 'partnerLogos');
  const existingSnap = await getDocs(colRef);
  existingSnap.forEach(d => batch.delete(d.ref));
  
  logos.forEach((logo, index) => {
    const docId = logo.id || `partner_${index}_${Date.now()}`;
    const docRef = doc(db, 'partnerLogos', docId);
    batch.set(docRef, {
      ...logo,
      id: docId,
      order: index,
      updated_at: new Date().toISOString()
    });
  });
  await batch.commit();
}

export async function getPricingPlans(): Promise<any[]> {
  if (!db) return [];
  const colRef = collection(db, 'pricingPlans');
  const snap = await getDocs(query(colRef, orderBy('order', 'asc')));
  if (snap.empty) {
    const fallbackSnap = await getDocs(colRef);
    return fallbackSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function savePricingPlans(plans: any[]): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  const colRef = collection(db, 'pricingPlans');
  const existingSnap = await getDocs(colRef);
  existingSnap.forEach(d => batch.delete(d.ref));

  plans.forEach((plan, index) => {
    const docId = plan.id || `plan_${index}_${Date.now()}`;
    const docRef = doc(db, 'pricingPlans', docId);
    batch.set(docRef, {
      ...plan,
      id: docId,
      order: index,
      updated_at: new Date().toISOString()
    });
  });
  await batch.commit();
}

export async function getTestimonialsList(): Promise<any[]> {
  if (!db) return [];
  const colRef = collection(db, 'testimonials');
  const snap = await getDocs(colRef);
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function saveTestimonialsList(testimonials: any[]): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  const colRef = collection(db, 'testimonials');
  const existingSnap = await getDocs(colRef);
  existingSnap.forEach(d => batch.delete(d.ref));

  testimonials.forEach((t, index) => {
    const docId = t.id || `testimonial_${index}_${Date.now()}`;
    const docRef = doc(db, 'testimonials', docId);
    batch.set(docRef, {
      ...t,
      id: docId,
      order: index,
      updated_at: new Date().toISOString()
    });
  });
  await batch.commit();
}

export async function getLivePlatformStats(): Promise<{
  activeTraders: number;
  verifiedFirms: number;
  challenges: number;
  reviews: number;
}> {
  if (!db) {
    return {
      activeTraders: 10,
      verifiedFirms: 7,
      challenges: 42,
      reviews: 0,
    };
  }
  try {
    const [usersSnap, firmsSnap, challsSnap, revsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'firms')),
      getDocs(collection(db, 'challenges')),
      getDocs(collection(db, 'reviews')),
    ]);

    const usersCount = usersSnap.size;
    const firmsCount = firmsSnap.size;
    const challsCount = challsSnap.size;
    const postedRevsCount = revsSnap.size;

    return {
      activeTraders: usersCount > 0 ? usersCount : 10,
      verifiedFirms: firmsCount > 0 ? firmsCount : 7,
      challenges: challsCount > 0 ? challsCount : 42,
      reviews: postedRevsCount,
    };
  } catch (err) {
    console.error('Failed to get live platform stats:', err);
    return {
      activeTraders: 10,
      verifiedFirms: 7,
      challenges: 42,
      reviews: 0,
    };
  }
}

export async function getFaqs(): Promise<any[]> {
  if (!db) return [];
  const colRef = collection(db, 'faqs');
  const snap = await getDocs(colRef);
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

// ==========================================
// REFERRAL & USER TRACKING SERVICES
// ==========================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function syncUserProfile(profile: UserProfile): Promise<void> {
  if (!db) return;
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, {
    ...profile,
    updated_at: new Date().toISOString()
  }, { merge: true });
}

export async function validateReferralCode(code: string): Promise<string | null> {
  if (!db || !code) return null;
  const normalized = code.trim().toUpperCase();
  const q = query(collection(db, 'users'), where('referral_code', '==', normalized));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }
  // Also check traderId for fallback compatibility
  const q2 = query(collection(db, 'users'), where('traderId', '==', code.trim()));
  const snap2 = await getDocs(q2);
  if (!snap2.empty) {
    return snap2.docs[0].id;
  }
  return null;
}

export async function trackReferralVisit(code: string, referrerUid: string): Promise<void> {
  if (!db) return;
  
  // Client check: Check if they already have an attribution locally to avoid duplicating
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('empirial_attribution');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.referralCode === code) {
          // Already tracked this visitor for this referral code, skip
          return;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Generate a unique anonymous visitor ID
    const visitorId = `VIS_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const landingPage = window.location.pathname || '/';
    const visitedAt = new Date().toISOString();
    
    // Save to localStorage
    const attribution = {
      visitorId,
      referralCode: code,
      referrerUserId: referrerUid,
      visitedAt
    };
    localStorage.setItem('empirial_attribution', JSON.stringify(attribution));
    
    // Write anonymous tracking document to Firestore
    const docRef = doc(db, 'referralVisitors', visitorId);
    await setDoc(docRef, {
      visitorId,
      referralCode: code,
      referrerUserId: referrerUid,
      registeredUserId: null,
      landingPage,
      visitedAt,
      registeredAt: null,
      status: 'anonymous'
    });
  }
}

export async function convertReferralAttribution(userId: string, displayName: string, email: string): Promise<void> {
  if (!db) return;
  if (typeof window === 'undefined') return;
  
  const attributionStr = localStorage.getItem('empirial_attribution');
  if (!attributionStr) return;
  
  try {
    const attribution = JSON.parse(attributionStr);
    const { visitorId, referralCode, referrerUserId } = attribution;
    
    if (!visitorId || !referralCode || !referrerUserId) return;
    
    // Self-referral protection: user cannot refer themselves
    if (referrerUserId === userId) {
      console.warn('Self-referral detected and blocked.');
      localStorage.removeItem('empirial_attribution');
      return;
    }
    
    // Check if user is already referred (Existing-user protection)
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().referredBy) {
      // Already has a referrer, do not overwrite
      localStorage.removeItem('empirial_attribution');
      return;
    }
    
    // 1. Update the anonymous referral visitor record in Firestore
    const visitorDocRef = doc(db, 'referralVisitors', visitorId);
    await setDoc(visitorDocRef, {
      status: 'registered',
      registeredUserId: userId,
      registeredAt: new Date().toISOString()
    }, { merge: true });
    
    // 2. Set the referrer fields on the new user's document
    await setDoc(userDocRef, {
      referredBy: referrerUserId,
      referralCodeUsed: referralCode
    }, { merge: true });
    
    // 3. Create a referral item under the referrer's referrals subcollection
    const referralItemRef = doc(db, 'users', referrerUserId, 'referrals', userId);
    await setDoc(referralItemRef, {
      id: userId,
      name: displayName || 'Referred Trader',
      email: email || 'N/A',
      joined_at: new Date().toISOString(),
      status: 'account_created',
      points_earned: 100,
      commission_earned: 0
    });
    
    // 4. Reward the referrer: Increment their points and counts
    const referrerDocRef = doc(db, 'users', referrerUserId);
    await setDoc(referrerDocRef, {
      points: increment(100),
      referral_points: increment(100),
      referrals_count: increment(1)
    }, { merge: true });
    
    // Clear attribution once successfully converted
    localStorage.removeItem('empirial_attribution');
  } catch (err) {
    console.error('Error converting referral attribution:', err);
  }
}

export async function getReferralStats(uid: string) {
  if (!db) return { visitorsCount: 0, registrationsCount: 0, conversionRate: 0, referralsList: [] };
  
  try {
    // Count visitors
    const visitorsQuery = query(collection(db, 'referralVisitors'), where('referrerUserId', '==', uid));
    const visitorsSnap = await getDocs(visitorsQuery);
    const visitorsCount = visitorsSnap.size;
    
    // Query referrals subcollection
    const refsSubColRef = collection(db, 'users', uid, 'referrals');
    const refsSnap = await getDocs(refsSubColRef);
    const referralsList = refsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Referred Trader',
        email: data.email || 'N/A',
        joined_at: data.joined_at || new Date().toISOString(),
        status: data.status || 'account_created',
        points_earned: data.points_earned || 0,
        commission_earned: data.commission_earned || 0,
        purchased_account_title: data.purchased_account_title
      };
    });
    
    const registrationsCount = referralsList.length;
    const conversionRate = visitorsCount > 0 ? (registrationsCount / visitorsCount) * 100 : 0;
    
    return {
      visitorsCount,
      registrationsCount,
      conversionRate,
      referralsList
    };
  } catch (err) {
    console.error('Error fetching user referral stats:', err);
    return { visitorsCount: 0, registrationsCount: 0, conversionRate: 0, referralsList: [] };
  }
}

export async function getAdminReferralStats() {
  if (!db) return { totalVisitors: 0, totalRegistrations: 0, activeReferrers: 0, conversionRate: 0, referrers: [], leads: [] };
  
  try {
    // 1. Fetch all referral visitors
    const visitorsSnap = await getDocs(collection(db, 'referralVisitors'));
    const visitors = visitorsSnap.docs.map(doc => doc.data());
    const totalVisitors = visitors.length;
    
    // 2. Fetch all users
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(doc => doc.data());
    
    // 3. Filter referred users
    const referredUsers = users.filter(u => u.referredBy);
    const totalRegistrations = referredUsers.length;
    
    // 4. Calculate active referrers
    const referrerIds = new Set(visitors.map(v => v.referrerUserId).filter(Boolean));
    const activeReferrers = referrerIds.size;
    
    // 5. Conversion rate
    const conversionRate = totalVisitors > 0 ? (totalRegistrations / totalVisitors) * 100 : 0;
    
    // 6. Stats per referrer
    const referrersMap: { [uid: string]: { name: string, code: string, visitors: number, registrations: number } } = {};
    
    users.forEach(u => {
      referrersMap[u.uid] = {
        name: u.displayName || u.email || 'Anonymous Trader',
        code: u.referral_code || u.traderId || 'N/A',
        visitors: 0,
        registrations: 0
      };
    });
    
    visitors.forEach(v => {
      if (v.referrerUserId) {
        if (!referrersMap[v.referrerUserId]) {
          referrersMap[v.referrerUserId] = { name: 'Unknown User', code: v.referralCode || 'N/A', visitors: 0, registrations: 0 };
        }
        referrersMap[v.referrerUserId].visitors++;
      }
    });
    
    referredUsers.forEach(u => {
      if (u.referredBy && referrersMap[u.referredBy]) {
        referrersMap[u.referredBy].registrations++;
      }
    });
    
    const referrersList = Object.keys(referrersMap).map(uid => {
      const item = referrersMap[uid];
      const rate = item.visitors > 0 ? (item.registrations / item.visitors) * 100 : 0;
      return {
        uid,
        name: item.name,
        code: item.code,
        visitors: item.visitors,
        registrations: item.registrations,
        conversionRate: rate
      };
    }).filter(r => r.visitors > 0 || r.registrations > 0);
    
    referrersList.sort((a, b) => b.registrations - a.registrations);
    
    // 7. Mapped leads
    const leadsList = visitors.map(v => {
      const referrerUser = users.find(u => u.uid === v.referrerUserId);
      const registeredUser = users.find(u => u.uid === v.registeredUserId);
      return {
        visitorId: v.visitorId,
        status: v.status === 'registered' ? 'REGISTERED' : 'NOT REGISTERED',
        name: v.status === 'registered' ? (registeredUser?.displayName || registeredUser?.email || 'Registered User') : 'Anonymous Visitor',
        referredByCode: v.referralCode || 'N/A',
        referredByUid: v.referrerUserId,
        referredByName: referrerUser?.displayName || 'Unknown Referrer',
        visitedAt: v.visitedAt || new Date().toISOString()
      };
    });
    
    leadsList.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
    
    return {
      totalVisitors,
      totalRegistrations,
      activeReferrers,
      conversionRate,
      referrers: referrersList,
      leads: leadsList
    };
  } catch (err) {
    console.error('Error fetching admin referral stats:', err);
    return { totalVisitors: 0, totalRegistrations: 0, activeReferrers: 0, conversionRate: 0, referrers: [], leads: [] };
  }
}
