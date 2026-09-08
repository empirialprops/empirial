const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const projectIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.*)/);
const clientEmailMatch = envContent.match(/FIREBASE_CLIENT_EMAIL=(.*)/);
const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([\s\S]*?)"/);

const projectId = projectIdMatch ? projectIdMatch[1].trim() : undefined;
const clientEmail = clientEmailMatch ? clientEmailMatch[1].trim() : undefined;
const privateKey = privateKeyMatch ? privateKeyMatch[1].replace(/\\n/g, '\n').trim() : undefined;

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
  const snapshot = await db.collection('reviews').get();
  const reviews = [];
  snapshot.forEach(doc => {
    reviews.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Fetched ${reviews.length} reviews from Firestore:`);
  reviews.forEach((r, idx) => {
    console.log(`[${idx+1}] ID: ${r.id} | firm_id: "${r.firm_id}" | firm_name: "${r.firm_name}" | user: "${r.full_name}" | rating: ${r.overall_rating}`);
  });
}

run().catch(console.error);
