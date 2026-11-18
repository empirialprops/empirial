require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY is missing in your .env.local file.');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const email = 'admin@anurajfx.com';
  const password = 'Anuraj@admin12145';

  console.log(`Checking if user ${email} already exists...`);
  
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`User already exists in Firebase Auth (UID: ${userRecord.uid}).`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User does not exist. Creating account...`);
      userRecord = await auth.createUser({
        email,
        password,
        displayName: 'Anuraj Admin'
      });
      console.log(`Successfully created Auth user (UID: ${userRecord.uid}).`);
    } else {
      throw error;
    }
  }

  console.log('Whitelisting user in Firestore admins collection...');
  await db.collection('admins').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName: 'Anuraj Admin',
    role: 'super_admin',
    is_active: true,
    created_at: new Date().toISOString()
  });

  console.log('✅ Admin user created and whitelisted successfully!');
}

createAdmin().catch(console.error);
