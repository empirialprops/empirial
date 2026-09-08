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
  console.log(`Fetched ${firms.length} firms from Firestore:`);
  firms.forEach((f) => {
    console.log(`ID: "${f.id}" | slug: "${f.slug}" | name: "${f.name}"`);
  });
}

run().catch(console.error);
