import { Award } from '@/lib/types';

export const MOCK_AWARDS: Award[] = [
  {
    id: 'aw-1',
    category_name: 'Best Customer Support 2026',
    description: 'Awarded for round-the-clock multinational support desk excellence and prompt dispute resolution.',
    year: 2026,
    is_voting_open: true,
    nominated_firms: [
      { firm_id: 'dolvero', firm_name: 'Dolvero', votes: 450 },
      { firm_id: 'nys', firm_name: 'NYS Capital', votes: 310 },
      { firm_id: 'ck-capital', firm_name: 'CK Capital', votes: 280 }
    ]
  },
  {
    id: 'aw-2',
    category_name: 'Most Innovative Evaluation Model 2026',
    description: 'Awarded for introducing the industry-leading 1-Step trailing drawdown scaling structure.',
    year: 2026,
    is_voting_open: true,
    nominated_firms: [
      { firm_id: 'nys', firm_name: 'NYS Capital', votes: 380 },
      { firm_id: 'shark-funded', firm_name: 'Shark Funded', votes: 320 },
      { firm_id: 'alpha-capital', firm_name: 'Alpha Capital', votes: 290 }
    ]
  }
];
