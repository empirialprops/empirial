import { Payout } from '@/lib/types';

export const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'pay-1',
    firm_id: 'dolvero',
    firm_name: 'Dolvero',
    trader_display_name: 'Alex Mercer',
    amount: 12500,
    currency: 'USD',
    region: 'Europe',
    concept: 'ICT / SMC',
    account_size: '100K',
    payout_method: 'Crypto / Rise',
    proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    is_verified: true,
    payout_date: '2026-08-10'
  },
  {
    id: 'pay-2',
    firm_id: 'nys',
    firm_name: 'NYS Capital',
    trader_display_name: 'Anuraj Sen',
    amount: 8400,
    currency: 'USD',
    region: 'India',
    concept: 'Price Action',
    account_size: '100K',
    payout_method: 'Bank Wire',
    proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    is_verified: true,
    payout_date: '2026-08-18'
  },
  {
    id: 'pay-3',
    firm_id: 'ck-capital',
    trader_display_name: 'Sophie Dubois',
    firm_name: 'CK Capital',
    amount: 14200,
    currency: 'USD',
    region: 'Europe',
    concept: 'Scalping',
    account_size: '200K',
    payout_method: 'Crypto / Rise',
    proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    is_verified: true,
    payout_date: '2026-08-22'
  }
];
