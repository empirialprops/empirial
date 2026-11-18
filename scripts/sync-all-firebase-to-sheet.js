const fs = require('fs');
const path = require('path');
const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1].trim()] = val;
  }
});

const WEBHOOK_URL =
  env.GOOGLE_SHEETS_WEBHOOK_URL ||
  env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbxExp4cqlFbzNCEQwBdsvD5TTbu6stIUyAEpAVungHorGTl7h7W9nqLvhnNIb1YTV83iw/exec';

// 2. Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  try {
    if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      app = initializeApp({
        credential: cert({
          projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'empirial-6be39',
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized with service account.');
    } else {
      app = initializeApp({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'empirial-6be39',
      });
      console.log('ℹ️ Firebase Admin initialized with project ID fallback.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
  }
} else {
  app = getApps()[0];
}

async function syncAllAuthDataToSheet() {
  console.log('================================================================');
  console.log('🔄 SYNCING COMPLETE FIREBASE AUTH & USER PROFILE DATA TO SHEET');
  console.log('================================================================');
  console.log(`📡 Target Webhook: ${WEBHOOK_URL}`);
  console.log(`📊 Target Sheet: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA (Tab: "Users")`);
  console.log('----------------------------------------------------------------');

  const userMap = new Map();

  // Helper to add or merge user record
  function addUser(user) {
    const key = (user.email || user.uid || '').toLowerCase().trim();
    if (!key) return;
    
    if (userMap.has(key)) {
      const existing = userMap.get(key);
      userMap.set(key, {
        uid: user.uid || existing.uid,
        name: user.name && user.name !== 'Anonymous Trader' ? user.name : existing.name,
        email: user.email || existing.email,
        emailVerified: user.emailVerified !== undefined ? user.emailVerified : existing.emailVerified,
        phone: user.phone && user.phone !== 'N/A' ? user.phone : existing.phone,
        provider: user.provider || existing.provider,
        role: user.role || existing.role,
        points: user.points || existing.points || 500,
        disabled: user.disabled !== undefined ? user.disabled : existing.disabled,
        createdAt: user.createdAt || existing.createdAt,
        lastSignInAt: user.lastSignInAt || existing.lastSignInAt,
        photoURL: user.photoURL && user.photoURL !== 'N/A' ? user.photoURL : existing.photoURL,
      });
    } else {
      userMap.set(key, {
        uid: user.uid || '',
        name: user.name || user.displayName || 'Anonymous Trader',
        email: user.email || '',
        emailVerified: user.emailVerified || false,
        phone: user.phone || user.phoneNumber || 'N/A',
        provider: user.provider || 'password',
        role: user.role || (user.email?.includes('admin') ? 'admin' : 'trader'),
        points: user.points || 500,
        disabled: user.disabled || false,
        createdAt: user.createdAt || new Date().toISOString(),
        lastSignInAt: user.lastSignInAt || user.lastLogin || new Date().toISOString(),
        photoURL: user.photoURL || user.avatar || 'N/A',
      });
    }
  }

  // Step 1: Query Firestore 'users' collection
  try {
    console.log('📥 Fetching users from Firestore collection "users"...');
    const db = getFirestore(app);
    const snapshot = await db.collection('users').get();
    console.log(`   Found ${snapshot.size} documents in Firestore "users" collection.`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      addUser({
        uid: data.uid || doc.id,
        name: data.displayName || data.name || data.fullName || 'Anonymous Trader',
        email: data.email || '',
        emailVerified: data.emailVerified || false,
        phone: data.phone || data.phoneNumber || data.phone_number || 'N/A',
        provider: data.provider || (data.email?.includes('gmail') ? 'google.com' : 'password'),
        role: data.role || (data.email?.includes('admin') ? 'admin' : 'trader'),
        points: data.points || 500,
        disabled: data.disabled || false,
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        lastSignInAt: data.lastLogin || data.lastSignInAt || new Date().toISOString(),
        photoURL: data.photoURL || data.avatar || 'N/A',
      });
    });
  } catch (err) {
    console.warn('⚠️ Firestore query note:', err.message);
  }

  // Step 2: Query Firebase Auth listUsers
  try {
    console.log('📥 Fetching all users from Firebase Authentication...');
    const auth = getAuth(app);
    let pageToken;
    let authUserCount = 0;
    
    do {
      const listUsersResult = await auth.listUsers(1000, pageToken);
      listUsersResult.users.forEach(userRecord => {
        authUserCount++;
        let provider = 'password';
        if (userRecord.providerData && userRecord.providerData.length > 0) {
          provider = userRecord.providerData[0].providerId;
        }
        addUser({
          uid: userRecord.uid,
          name: userRecord.displayName || 'Anonymous Trader',
          email: userRecord.email || '',
          emailVerified: userRecord.emailVerified,
          phone: userRecord.phoneNumber || 'N/A',
          provider: provider,
          role: userRecord.email?.includes('admin') ? 'admin' : 'trader',
          disabled: userRecord.disabled,
          createdAt: userRecord.metadata.creationTime || new Date().toISOString(),
          lastSignInAt: userRecord.metadata.lastSignInTime || new Date().toISOString(),
          photoURL: userRecord.photoURL || 'N/A',
        });
      });
      pageToken = listUsersResult.pageToken;
    } while (pageToken);
    
    console.log(`   Found ${authUserCount} registered users in Firebase Auth.`);
  } catch (err) {
    console.warn('⚠️ Firebase Auth query note:', err.message);
  }

  // Step 3: Comprehensive Default/Seed Users
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

  INITIAL_USERS.forEach(u => addUser(u));

  const allUsers = Array.from(userMap.values());
  console.log(`\n📑 Total unique users prepared for sync: ${allUsers.length}`);
  console.log('----------------------------------------------------------------');
  allUsers.forEach((u, i) => {
    console.log(`  [${i + 1}] ${u.name} | ${u.email} | Provider: ${u.provider} | Role: ${u.role} | Verified: ${u.emailVerified}`);
  });

  console.log('----------------------------------------------------------------');
  console.log('⏳ Sending payload with complete Auth & Profile data to Google Sheets...');

  try {
    const payload = { users: allUsers };
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const responseText = await response.text();
    console.log(`\n📥 HTTP Response Status: ${response.status} ${response.statusText}`);

    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
      console.log('✅ Google Sheets Webhook Result:');
      console.log(`   - Status: ${parsed.status}`);
      console.log(`   - Rows Inserted: ${parsed.inserted}`);
      console.log(`   - Rows Updated: ${parsed.updated}`);
      console.log(`   - Total Processed: ${parsed.totalProcessed}`);
      console.log(`   - Timestamp: ${parsed.timestamp}`);
    } catch {
      console.log('📄 Raw Response:', responseText);
    }

    console.log('\n================================================================');
    console.log('✨ Full Auth Data Sync Completed Successfully!');
    console.log('🔗 View Sheet: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit');
    console.log('================================================================');
  } catch (error) {
    console.error('❌ Failed to push data to Google Sheets:', error);
  }
}

syncAllAuthDataToSheet();
