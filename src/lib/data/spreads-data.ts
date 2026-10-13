import { BrokerSpread } from '@/lib/types';

export const MOCK_SPREADS: BrokerSpread[] = [
  {
    id: 'spr-1',
    feed_name: 'NYS Liquidity Provider',
    pair: 'EURUSD',
    spread_pips: 0.1,
    commission_per_lot: 3,
    account_type: 'Raw Spreads',
    platform: 'cTrader',
    status: 'active'
  },
  {
    id: 'spr-2',
    feed_name: 'CK Liquidity Provider',
    pair: 'GBPUSD',
    spread_pips: 0.3,
    commission_per_lot: 3.5,
    account_type: 'Raw Spreads',
    platform: 'MT5',
    status: 'active'
  },
  {
    id: 'spr-3',
    feed_name: 'Dolvero Prime Liquidity',
    pair: 'EURUSD',
    spread_pips: 0.1,
    commission_per_lot: 3,
    account_type: 'Raw Spreads',
    platform: 'cTrader',
    status: 'active'
  },
  {
    id: 'spr-4',
    feed_name: 'Shark Funded Liquidity',
    pair: 'XAUUSD',
    spread_pips: 1.1,
    commission_per_lot: 2,
    account_type: 'Raw Spreads',
    platform: 'MT5',
    status: 'active'
  }
];
