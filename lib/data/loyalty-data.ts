import { LoyaltyReward } from '@/lib/types';

export const MOCK_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew-dolvero-100',
    title: 'Free Dolvero $10K Challenge Voucher',
    description: 'Get a 100% discount promo voucher for a standard $10,000 evaluation challenge at Dolvero.',
    points_cost: 2000,
    voucher_code: 'DOLVERO-FREE-10K-XYZ',
    is_available: true,
    category: 'challenges'
  },
  {
    id: 'rew-nys-200',
    title: 'Free NYS Capital $25K Challenge Voucher',
    description: 'Claim a free voucher for a 1-step $25,000 evaluation challenge at NYS Capital.',
    points_cost: 3000,
    voucher_code: 'NYS-FREE-25K-ABC',
    is_available: true,
    category: 'challenges'
  },
  {
    id: 'rew-ck-300',
    title: 'Free CK Capital $50K Challenge Voucher',
    description: 'Claim a free voucher for a 2-step $50,000 evaluation challenge at CK Capital.',
    points_cost: 4500,
    voucher_code: 'CK-FREE-50K-123',
    is_available: true,
    category: 'challenges'
  },
  {
    id: 'rew-emp-hoodie',
    title: 'EMPIRIAL Premium Trading Hoodie',
    description: 'High-quality cotton trading hoodie with embroidered EMPIRIAL logo. Shipped worldwide.',
    points_cost: 1500,
    voucher_code: 'SHIPPED-DIRECTLY',
    is_available: true,
    category: 'merchandise'
  }
];
