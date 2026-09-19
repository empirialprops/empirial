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
  let updatedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const fId = (data.firm_id || '').toLowerCase();
    const fName = (data.firm_name || '').toLowerCase();
    
    // Check if this review belongs to Sure Leverage Funding
    if (fId === 'sure-leverage' || fId === 'sure-leverage-funding' || fId === 'slf' || fName === 'verified firm' || fName.includes('sure leverage')) {
      await doc.ref.update({
        firm_id: 'sure-leverage-funding',
        firm_name: 'Sure Leverage Funding'
      });
      updatedCount++;
      console.log(`Updated review ${doc.id} (${data.full_name}) -> firm_id: "sure-leverage-funding", firm_name: "Sure Leverage Funding"`);
    }
  }
  
  console.log(`Finished updating ${updatedCount} reviews in Firestore.`);
}

run().catch(console.error);
