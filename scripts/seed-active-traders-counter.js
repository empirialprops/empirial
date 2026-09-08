/**
 * Run once to seed the siteStats/counters document with the current user count.
 * node scripts/seed-active-traders-counter.js
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seedCounter() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Counting users in Firestore...');
  const usersSnap = await getDocs(collection(db, 'users'));
  const count = usersSnap.size;
  console.log(`Found ${count} registered users.`);

  const counterRef = doc(db, 'siteStats', 'counters');
  await setDoc(counterRef, { active_traders: count }, { merge: true });
  console.log(`✅ siteStats/counters.active_traders set to ${count}`);
  process.exit(0);
}

seedCounter().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
