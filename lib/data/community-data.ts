import { CommunityPost } from '@/lib/types';

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    title: 'NYS Capital Drawdown Rules Clarification',
    body: 'Can someone clarify if the trailing drawdown at NYS Capital locks in at your balance high watermark daily or if it trailing is based on active closed trades only?',
    user_name: 'Anuraj Trader',
    user_avatar: 'AT',
    is_verified: true,
    firm_tag: 'NYS Capital',
    category_tag: 'RULES',
    upvotes: 15,
    downvotes: 1,
    views: 124,
    comments_count: 2,
    created_at: '2026-08-28T12:00:00Z',
    comments: [
      {
        id: 'c-1',
        user_name: 'Sophie Dubois',
        content: 'It is based on closed balance at the end of the day. If your balance grows, the trailing threshold stays at balance - 6%. It stops trailing once it reaches initial balance.',
        created_at: '2026-08-28T14:30:00Z',
        upvotes: 4
      },
      {
        id: 'c-2',
        user_name: 'Alex Mercer',
        content: 'Correct, Sophie. Once it reaches the starting deposit balance, it locks as a static drawdown relative to the starting balance.',
        created_at: '2026-08-28T15:10:00Z',
        upvotes: 2
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Best session time parameters for passing CK Capital challenge',
    body: 'I am trading London session and find spreads to be extremely low on cTrader. Anyone else notice this?',
    user_name: 'cTrader_Pro',
    user_avatar: 'CP',
    is_verified: true,
    firm_tag: 'CK Capital',
    category_tag: 'KNOWLEDGE',
    upvotes: 8,
    downvotes: 0,
    views: 89,
    comments_count: 1,
    created_at: '2026-08-29T08:00:00Z',
    comments: [
      {
        id: 'c-3',
        user_name: 'Anuraj Trader',
        content: 'Yes! London volume is excellent and the cTrader server has sub-millisecond execution. Definitely stick to London or early New York.',
        created_at: '2026-08-29T09:15:00Z',
        upvotes: 3
      }
    ]
  }
];
