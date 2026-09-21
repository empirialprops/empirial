const fs = require('fs');
const path = require('path');

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

// 2. Comprehensive list of Firebase users to seed into the Google Sheet
const USERS_TO_SEED = [
  {
    uid: 'user_alex_miller_001',
    name: 'Alex Miller',
    displayName: 'Alex Miller',
    email: 'alex.miller@empirialtraders.com',
    phone: '+1 (555) 234-5678',
    provider: 'google.com',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    uid: 'user_marcus_chen_002',
    name: 'Marcus Chen',
    displayName: 'Marcus Chen',
    email: 'marcus.chen@empirialtraders.com',
    phone: '+1 (555) 876-5432',
    provider: 'discord.com',
    createdAt: '2026-02-01T14:30:00.000Z'
  },
  {
    uid: 'user_sarah_jenkins_003',
    name: 'Sarah Jenkins',
    displayName: 'Sarah Jenkins',
    email: 'sarah.jenkins@empirialtraders.com',
    phone: '+44 20 7946 0912',
    provider: 'password',
    createdAt: '2026-02-18T09:15:00.000Z'
  },
  {
    uid: 'user_anuraj_admin_000',
    name: 'Anuraj (Empirial Admin)',
    displayName: 'Anuraj (Empirial Admin)',
    email: 'anuraj@empirialprops.com',
    phone: '+91 98765 43210',
    provider: 'google.com',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'trader-001',
    name: 'Demo Trader',
    displayName: 'Demo Trader',
    email: 'trader@empirial.com',
    phone: '+1 (555) 000-1111',
    provider: 'password',
    createdAt: '2026-01-10T12:00:00.000Z'
  },
  {
    uid: 'admin-001',
    name: 'System Admin',
    displayName: 'System Admin',
    email: 'admin@empirial.com',
    phone: '+1 (555) 000-9999',
    provider: 'password',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'user_elena_rostova_004',
    name: 'Elena Rostova',
    displayName: 'Elena Rostova',
    email: 'elena.rostova@empirialtraders.com',
    phone: '+49 30 123456',
    provider: 'google.com',
    createdAt: '2026-02-25T11:20:00.000Z'
  },
  {
    uid: 'user_david_kim_005',
    name: 'David Kim',
    displayName: 'David Kim',
    email: 'david.kim@empirialtraders.com',
    phone: '+82 2 3456 7890',
    provider: 'password',
    createdAt: '2026-03-01T08:45:00.000Z'
  }
];

async function seedGoogleSheet() {
  console.log('================================================================');
  console.log('🚀 SEEDING GOOGLE SHEET FROM FIREBASE DATA');
  console.log('================================================================');
  console.log(`📡 Target Webhook: ${WEBHOOK_URL}`);
  console.log(`📊 Spreadsheet ID: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA`);
  console.log(`📑 Users to Seed: ${USERS_TO_SEED.length}`);
  console.log('----------------------------------------------------------------');

  // Print users list
  USERS_TO_SEED.forEach((u, i) => {
    console.log(`  [${i + 1}] ${u.name} | ${u.email} | Provider: ${u.provider} | Phone: ${u.phone}`);
  });

  console.log('----------------------------------------------------------------');
  console.log('⏳ Sending batch payload to Google Apps Script Webhook...');

  try {
    const payload = {
      users: USERS_TO_SEED.map(u => ({
        uid: u.uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        provider: u.provider,
        createdAt: u.createdAt,
      }))
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const responseText = await response.text();
    console.log(`\n📥 HTTP Status: ${response.status} ${response.statusText}`);
    
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(responseText);
      console.log('✅ Parsed Response:', JSON.stringify(parsedJson, null, 2));
    } catch {
      console.log('📄 Raw Response Content:', responseText);
    }

    console.log('\n================================================================');
    console.log('✨ Seeding Completed Successfully!');
    console.log('🔗 View Sheet: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit');
    console.log('================================================================');
  } catch (error) {
    console.error('❌ Failed to seed Google Sheet:', error);
  }
}

seedGoogleSheet();
