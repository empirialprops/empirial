export interface UserPurchasedAccount {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_logo: string;
  account_type: string;
  account_size: number;
  platform: string;
  account_number: string;
  purchase_date: string;
  status: 'active' | 'passed' | 'scaling' | 'funded';
  order_id: string;
  price_paid: number;
}

export interface UserSupportMessage {
  id: string;
  sender: 'user' | 'support' | 'admin';
  sender_name: string;
  text: string;
  timestamp: string;
}

export interface UserSupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  subject: string;
  category: 'payouts' | 'accounts' | 'events' | 'discounts' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  messages: UserSupportMessage[];
}

export interface UserProfileReview {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_logo?: string;
  user_name: string;
  title: string;
  body: string;
  overall_rating: number;
  trading_conditions: number;
  customer_care: number;
  user_friendliness: number;
  payout_process: number;
  status: 'published' | 'pending' | 'replied';
  firm_reply?: {
    author: string;
    message: string;
    replied_at: string;
  };
  upvotes: number;
  created_at: string;
}

export interface UserReferralItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joined_at: string;
  status: 'account_created' | 'challenge_purchased';
  points_earned: number;
  commission_earned: number;
  purchased_account_title?: string;
}

export interface UserRedeemedReward {
  id: string;
  reward_title: string;
  category: 'cash' | 'challenge' | 'commission';
  points_spent: number;
  value_display: string;
  status: 'completed' | 'processing';
  date: string;
  delivery_info?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: 'admin' | 'super_admin' | 'data_entry' | 'reviews_support' | 'trader';
  avatarUrl?: string;
  traderId: string;
  points: number;
  accountsPurchased: UserPurchasedAccount[];
  country?: string;
  discordHandle?: string;
  bio?: string;
  is_verified?: boolean;
  verification_status?: 'not_applied' | 'pending' | 'approved' | 'rejected';
  following_ids?: string[];
  firm_badge?: string;
  firm_logo?: string;
  referral_code?: string;
  referrals_count?: number;
  referral_points?: number;
  referral_commission?: number;
  referrals?: UserReferralItem[];
  redeemed_referral_rewards?: UserRedeemedReward[];
  referredBy?: string;
  referralCodeUsed?: string;
}

export const DEFAULT_PURCHASED_ACCOUNTS: UserPurchasedAccount[] = [];

export const DEMO_ADMIN: UserProfile = {
  uid: 'admin-001',
  email: 'admin@empirial.com',
  displayName: 'System Admin',
  phoneNumber: '',
  role: 'admin',
  traderId: 'EMP-ADM01',
  points: 0,
  accountsPurchased: [],
  country: 'Global',
  discordHandle: '',
  bio: 'EMPIRIAL System Administrator.',
  is_verified: true,
  verification_status: 'approved',
  following_ids: [],
};

export const DEMO_TRADER: UserProfile = {
  uid: 'trader-001',
  email: 'trader@empirial.com',
  displayName: 'Trader',
  phoneNumber: '',
  role: 'trader',
  traderId: 'EMP-00001',
  points: 0,
  accountsPurchased: [],
  country: '',
  discordHandle: '',
  bio: '',
  is_verified: false,
  verification_status: 'not_applied',
  following_ids: [],
  referral_code: 'EMP-00001',
  referrals_count: 0,
  referral_points: 0,
  referral_commission: 0,
};


export const INITIAL_USER_REVIEWS: UserProfileReview[] = [];

export const INITIAL_SUPPORT_TICKETS: UserSupportTicket[] = [];

// Helper Functions
export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('empirial_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

export function saveUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('empirial_user', JSON.stringify(user));
  localStorage.removeItem('empirial_logged_out');
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));

  // Asynchronously sync the user profile with Firestore in the background
  import('@/lib/firebase/config').then(({ db }) => {
    if (db) {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        const cleanUser = Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v !== undefined)
        );
        const docRef = doc(db, 'users', user.uid);
        setDoc(docRef, cleanUser, { merge: true }).catch((err) => {
          console.warn('Silent Firestore sync failed:', err);
        });
      });
    }
  }).catch((err) => {
    console.warn('Firebase config import failed during silent sync:', err);
  });

  // Asynchronously sync user details to Google Sheets Webhook
  import('@/lib/firebase/sheets-sync').then(({ syncUserToGoogleSheet }) => {
    syncUserToGoogleSheet({
      uid: user.uid,
      name: user.displayName || 'Trader',
      email: user.email || '',
      phone: user.phoneNumber || '',
      provider: user.email?.includes('gmail') ? 'google.com' : 'password',
      createdAt: new Date().toISOString(),
    }).catch(err => console.warn('Silent Google Sheet sync failed:', err));
  }).catch(err => console.warn('Sheets sync import failed:', err));
}

export function loginAsDemoTrader(): UserProfile {
  const user = { ...DEMO_TRADER };
  saveUser(user);
  return user;
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('empirial_user');
  localStorage.setItem('empirial_logged_out', 'true');
  
  // Trigger Firebase signOut in the background
  import('@/lib/firebase/config').then(({ auth }) => {
    import('firebase/auth').then(({ signOut }) => {
      signOut(auth).catch((err) => console.error('Firebase Auth sign out error:', err));
    });
  });
  
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
}

export function openAuthModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-login-modal'));
  }
}

export function closeAuthModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('close-login-modal'));
  }
}

export function getStoredSupportTickets(): UserSupportTicket[] {
  if (typeof window === 'undefined') return INITIAL_SUPPORT_TICKETS;
  const saved = localStorage.getItem('empirial_support_tickets');
  if (!saved) {
    localStorage.setItem('empirial_support_tickets', JSON.stringify(INITIAL_SUPPORT_TICKETS));
    return INITIAL_SUPPORT_TICKETS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_SUPPORT_TICKETS;
  }
}

export function saveSupportTickets(tickets: UserSupportTicket[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('empirial_support_tickets', JSON.stringify(tickets));
  window.dispatchEvent(new CustomEvent('support-tickets-changed', { detail: tickets }));
}

export function addSupportTicket(ticket: Omit<UserSupportTicket, 'id' | 'created_at' | 'updated_at' | 'messages' | 'status'> & { initialMessage: string }): UserSupportTicket {
  const tickets = getStoredSupportTickets();
  const newTicket: UserSupportTicket = {
    id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: ticket.user_id,
    user_name: ticket.user_name,
    user_email: ticket.user_email,
    user_phone: ticket.user_phone,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        sender_name: ticket.user_name,
        text: ticket.initialMessage,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    ],
  };
  const updated = [newTicket, ...tickets];
  saveSupportTickets(updated);

  import('@/lib/firebase/services').then(({ createSupportTicketInFirestore }) => {
    createSupportTicketInFirestore(newTicket);
  }).catch(err => console.warn('Silent Firestore ticket save error:', err));

  return newTicket;
}

export function replyToSupportTicket(ticketId: string, text: string, sender: 'user' | 'support' | 'admin', senderName: string): UserSupportTicket | null {
  const tickets = getStoredSupportTickets();
  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  if (ticketIndex === -1) return null;

  const ticket = tickets[ticketIndex];
  const newMsg: UserSupportMessage = {
    id: `msg-${Date.now()}`,
    sender,
    sender_name: senderName,
    text,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  ticket.messages.push(newMsg);
  ticket.updated_at = new Date().toISOString();
  if (sender === 'support' || sender === 'admin') {
    ticket.status = 'in_progress';
  }

  tickets[ticketIndex] = ticket;
  saveSupportTickets(tickets);

  import('@/lib/firebase/services').then(({ sendTicketReplyInFirestore }) => {
    sendTicketReplyInFirestore(ticketId, newMsg, (sender === 'support' || sender === 'admin') ? 'in_progress' : undefined);
  }).catch(err => console.warn('Silent Firestore ticket reply error:', err));

  return ticket;
}

export function getStoredUserReviews(): UserProfileReview[] {
  if (typeof window === 'undefined') return INITIAL_USER_REVIEWS;
  const saved = localStorage.getItem('empirial_user_reviews');
  if (!saved) {
    localStorage.setItem('empirial_user_reviews', JSON.stringify(INITIAL_USER_REVIEWS));
    return INITIAL_USER_REVIEWS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_USER_REVIEWS;
  }
}

export function saveUserReviews(reviews: UserProfileReview[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('empirial_user_reviews', JSON.stringify(reviews));
  window.dispatchEvent(new CustomEvent('user-reviews-changed', { detail: reviews }));
}

export function addUserReview(review: Omit<UserProfileReview, 'id' | 'created_at' | 'status' | 'upvotes'>): UserProfileReview {
  const reviews = getStoredUserReviews();
  const newReview: UserProfileReview = {
    id: `rev-user-${Date.now()}`,
    ...review,
    status: 'pending',
    upvotes: 0,
    created_at: new Date().toISOString().split('T')[0],
  };
  const updated = [newReview, ...reviews];
  saveUserReviews(updated);
  return newReview;
}

export const INITIAL_USER_REFERRALS: UserReferralItem[] = [];

export function getStoredReferrals(): UserReferralItem[] {
  if (typeof window === 'undefined') return INITIAL_USER_REFERRALS;
  const saved = localStorage.getItem('empirial_user_referrals');
  if (!saved) {
    localStorage.setItem('empirial_user_referrals', JSON.stringify(INITIAL_USER_REFERRALS));
    return INITIAL_USER_REFERRALS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_USER_REFERRALS;
  }
}

export function saveStoredReferrals(referrals: UserReferralItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('empirial_user_referrals', JSON.stringify(referrals));
  window.dispatchEvent(new CustomEvent('user-referrals-changed', { detail: referrals }));
}

export function addReferralInvite(name: string, email: string, purchasedAccount?: string): UserReferralItem {
  const current = getStoredReferrals();
  const hasPurchased = !!purchasedAccount;
  const commission = hasPurchased ? 45.00 : 0;
  const newRef: UserReferralItem = {
    id: `ref-${Date.now()}`,
    name,
    email,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    joined_at: new Date().toISOString().split('T')[0],
    status: hasPurchased ? 'challenge_purchased' : 'account_created',
    points_earned: 100,
    commission_earned: commission,
    purchased_account_title: purchasedAccount,
  };
  const updated = [newRef, ...current];
  saveStoredReferrals(updated);
  return newRef;
}

export function getStoredRedeemedRewards(): UserRedeemedReward[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('empirial_redeemed_rewards');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

export function addRedeemedReward(reward: Omit<UserRedeemedReward, 'id' | 'date' | 'status'>): UserRedeemedReward {
  const current = getStoredRedeemedRewards();
  const newReward: UserRedeemedReward = {
    id: `red-${Date.now()}`,
    ...reward,
    status: 'completed',
    date: new Date().toISOString().split('T')[0],
  };
  const updated = [newReward, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem('empirial_redeemed_rewards', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('redeemed-rewards-changed', { detail: updated }));
  }
  return newReward;
}
