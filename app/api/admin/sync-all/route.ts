import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCe9uxipeZcMDbMMMc2h4j7EuaADRfO7Dc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "goal-planner-3802e.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://goal-planner-3802e-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "goal-planner-3802e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "goal-planner-3802e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "848052161618",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:848052161618:web:68450bf3b90ea3f789238b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B9P8R3PHCB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      '';

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const userMap = new Map();

    function recordUser(u: any) {
      const key = (u.email || u.uid || '').toLowerCase().trim();
      if (!key) return;

      const existing = userMap.get(key) || {};
      userMap.set(key, {
        uid: u.uid || existing.uid || `user_${Date.now()}`,
        name: u.name || u.displayName || u.fullName || existing.name || 'Anonymous User',
        email: u.email || existing.email || '',
        emailVerified: u.emailVerified !== undefined ? u.emailVerified : (existing.emailVerified ?? false),
        phone: u.phone || u.phoneNumber || existing.phone || 'N/A',
        provider: u.provider || existing.provider || (u.email?.includes('gmail') ? 'google.com' : 'password'),
        role: u.role || existing.role || (u.email?.includes('admin') ? 'admin' : 'trader'),
        points: u.points !== undefined ? u.points : (existing.points ?? 500),
        disabled: u.disabled !== undefined ? u.disabled : (existing.disabled ?? false),
        createdAt: u.createdAt || u.created_at || existing.createdAt || new Date().toISOString(),
        lastSignInAt: u.lastSignInAt || u.lastLogin || existing.lastSignInAt || new Date().toISOString(),
        photoURL: u.photoURL || u.avatar || existing.photoURL || 'N/A'
      });
    }

    // 1. Pull from Firestore 'users' collection
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach(doc => {
        const data = doc.data();
        recordUser({ uid: doc.id, ...data });
      });
    } catch (err: any) {
      console.warn('Firestore fetch warning:', err.message);
    }

    // 2. Mock Initial / Seed Users
    const INITIAL_USERS = [
      {
        uid: 'user_alex_miller_001',
        name: 'Alex Miller',
        email: 'alex.miller@empirialtraders.com',
        emailVerified: true,
        phone: '+1 (555) 234-5678',
        provider: 'google.com',
        role: 'trader',
        points: 1250,
        disabled: false,
        createdAt: '2026-01-15T10:00:00.000Z',
        lastSignInAt: '2026-03-20T18:30:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        uid: 'user_marcus_chen_002',
        name: 'Marcus Chen',
        email: 'marcus.chen@empirialtraders.com',
        emailVerified: true,
        phone: '+1 (555) 876-5432',
        provider: 'discord.com',
        role: 'trader',
        points: 890,
        disabled: false,
        createdAt: '2026-02-01T14:30:00.000Z',
        lastSignInAt: '2026-03-21T09:12:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        uid: 'user_sarah_jenkins_003',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@empirialtraders.com',
        emailVerified: true,
        phone: '+44 20 7946 0912',
        provider: 'password',
        role: 'trader',
        points: 2100,
        disabled: false,
        createdAt: '2026-02-18T09:15:00.000Z',
        lastSignInAt: '2026-03-21T14:05:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        uid: 'user_anuraj_admin_000',
        name: 'Anuraj (Empirial Admin)',
        email: 'anuraj@empirialprops.com',
        emailVerified: true,
        phone: '+91 98765 43210',
        provider: 'google.com',
        role: 'admin',
        points: 99999,
        disabled: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastSignInAt: '2026-03-21T16:00:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      },
      {
        uid: 'trader-001',
        name: 'Demo Trader',
        email: 'trader@empirial.com',
        emailVerified: true,
        phone: '+1 (555) 000-1111',
        provider: 'password',
        role: 'trader',
        points: 500,
        disabled: false,
        createdAt: '2026-01-10T12:00:00.000Z',
        lastSignInAt: '2026-03-19T11:45:00.000Z',
        photoURL: 'N/A'
      },
      {
        uid: 'admin-001',
        name: 'System Admin',
        email: 'admin@empirial.com',
        emailVerified: true,
        phone: '+1 (555) 000-9999',
        provider: 'password',
        role: 'admin',
        points: 50000,
        disabled: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastSignInAt: '2026-03-21T15:20:00.000Z',
        photoURL: 'N/A'
      },
      {
        uid: 'user_elena_rostova_004',
        name: 'Elena Rostova',
        email: 'elena.rostova@empirialtraders.com',
        emailVerified: false,
        phone: '+49 30 123456',
        provider: 'google.com',
        role: 'trader',
        points: 620,
        disabled: false,
        createdAt: '2026-02-25T11:20:00.000Z',
        lastSignInAt: '2026-03-18T10:00:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        uid: 'user_david_kim_005',
        name: 'David Kim',
        email: 'david.kim@empirialtraders.com',
        emailVerified: true,
        phone: '+82 2 3456 7890',
        provider: 'password',
        role: 'trader',
        points: 1450,
        disabled: false,
        createdAt: '2026-03-01T08:45:00.000Z',
        lastSignInAt: '2026-03-21T07:30:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      }
    ];

    INITIAL_USERS.forEach(u => recordUser(u));

    const allUsers = Array.from(userMap.values());

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ users: allUsers }),
    });

    const responseText = await response.text();
    let resJson = { status: 'success' };
    try {
      resJson = JSON.parse(responseText);
    } catch {}

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      data: resJson,
    });
  } catch (error: any) {
    console.error('Admin sync all error:', error);
    return NextResponse.json({ error: error?.message || 'Sync failed' }, { status: 500 });
  }
}
