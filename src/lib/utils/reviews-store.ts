
import { Review } from '@/lib/types';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';

const STORAGE_KEY = 'empirial_reviews_list';
const INITIALIZED_KEY = 'empirial_reviews_initialized';

export function getStoredReviews(): Review[] {
  if (typeof window === 'undefined') return MOCK_REVIEWS;
  try {
    const isInit = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (isInit === 'true' && raw) {
      let parsed: Review[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out unadded default firms
        parsed = parsed.filter(r => r.firm_id !== 'ftmo' && r.firm_id !== 'funding-pips');
        return parsed;
      }
    }

    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_REVIEWS));
    return MOCK_REVIEWS;
  } catch {
    return MOCK_REVIEWS;
  }
}

export function saveStoredReviews(reviews: Review[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('empirial_reviews_changed', { detail: reviews }));
  } catch (err) {
    console.error('Failed to save reviews to localStorage:', err);
  }
}

export function addStoredReview(review: Review): Review[] {
  const current = getStoredReviews();
  const updated = [review, ...current.filter((r) => r.id !== review.id)];
  saveStoredReviews(updated);
  return updated;
}

export function updateStoredReview(id: string, updates: Partial<Review>): Review[] {
  const current = getStoredReviews();
  const updated = current.map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveStoredReviews(updated);
  return updated;
}

export function deleteStoredReview(id: string): Review[] {
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== id);
  saveStoredReviews(updated);
  return updated;
}
