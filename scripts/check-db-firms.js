const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1].trim()] = val;
  }
});

const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing env vars:', { projectId, clientEmail, hasKey: !!privateKey });
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey
  })
});

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('firms').get();
  const firms = [];
  snapshot.forEach(doc => {
    firms.push({ id: doc.id, ...doc.data() });
  });
  fs.writeFileSync(path.join(__dirname, 'firms-out.json'), JSON.stringify(firms, null, 2), 'utf8');
  console.log('Saved to scripts/firms-out.json');
}

run().catch(console.error);
