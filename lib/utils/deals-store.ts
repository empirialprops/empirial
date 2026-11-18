'use client';

import { Deal } from '@/lib/types';
import { MOCK_DEALS } from '@/lib/data/deals-data';

const STORAGE_KEY = 'empirial_deals_list';
const INITIALIZED_KEY = 'empirial_deals_initialized';

export function getStoredDeals(): Deal[] {
  if (typeof window === 'undefined') return MOCK_DEALS;
  try {
    const isInit = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (isInit === 'true') {
      if (!raw) return [];
      const parsed: Deal[] = JSON.parse(raw);
      return Array.isArray(parsed) ? sortDeals(parsed) : [];
    }

    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DEALS));
    return sortDeals(MOCK_DEALS);
  } catch {
    return MOCK_DEALS;
  }
}

export function saveStoredDeals(deals: Deal[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = sortDeals(deals);
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('empirial_deals_changed', { detail: sorted }));
  } catch (err) {
    console.error('Failed to save deals to localStorage:', err);
  }
}

export function addStoredDeal(deal: Deal): Deal[] {
  const current = getStoredDeals();
  const dealWithDate: Deal = {
    ...deal,
    created_at: deal.created_at || new Date().toISOString(),
    is_featured: deal.is_featured !== undefined ? deal.is_featured : true,
    is_verified: deal.is_verified !== undefined ? deal.is_verified : true,
  };
  // Prepend new deal to the list
  const updated = [dealWithDate, ...current.filter((d) => d.id !== deal.id)];
  saveStoredDeals(updated);
  return updated;
}

export function updateStoredDeal(id: string, updates: Partial<Deal>): Deal[] {
  const current = getStoredDeals();
  const updated = current.map((d) =>
    d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
  );
  saveStoredDeals(updated);
  return updated;
}

export function deleteStoredDeal(id: string): Deal[] {
  const current = getStoredDeals();
  const updated = current.filter((d) => d.id !== id);
  saveStoredDeals(updated);
  return updated;
}

export function sortDeals(deals: Deal[]): Deal[] {
  return [...deals].sort((a, b) => {
    // 1. Featured deals prioritized unless created_at is noticeably newer
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    if (timeA !== timeB) {
      return timeB - timeA; // Newest first
    }
    return (b.discount_pct || 0) - (a.discount_pct || 0);
  });
}
