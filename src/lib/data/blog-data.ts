import { BlogPost } from '../types';

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'manage-trailing-drawdown',
    title: 'How to Manage Trailing Drawdown in 1-Step Evaluations',
    excerpt: 'Trailing drawdown is the number one reason traders fail 1-step challenges. Learn how to buffer your profits and scale safely.',
    content: 'Trailing drawdown recalculates at the end of each session or in real-time based on high-water mark equity. To navigate this: 1. Keep leverage low. 2. Never risk more than 0.5% per trade. 3. Lock in partials early to build a buffer.',
    category: 'Risk Management',
    read_time: '5 min read',
    author: {
      name: 'Anuraj Sen',
      role: 'Risk Specialist',
      avatar: ''
    },
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    published_at: '2026-08-25'
  },
  {
    id: 'blog-2',
    slug: 'smc-vs-price-action',
    title: 'SMC vs. Price Action: Which Strategy Passes Challenges Faster?',
    excerpt: 'An empirical comparison of Smart Money Concepts and pure Price Action strategy passing rates across 10,000 audited accounts.',
    content: 'Our database statistics reveal that SMC setups (order blocks, fair value gaps) show higher risk-to-reward profiles, but traditional Price Action (support/resistance, flags) delivers more consistent win rates under daily drawdown constraints.',
    category: 'Trading Strategy',
    read_time: '7 min read',
    author: {
      name: 'Sophie Dubois',
      role: 'Market Analyst',
      avatar: ''
    },
    cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    published_at: '2026-08-27'
  }
];
