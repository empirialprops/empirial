import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminDb: Firestore;
let adminAuth: Auth;

if (getApps().length === 0) {
  try {
    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (parsed && parsed.private_key && parsed.client_email) {
          serviceAccount = parsed;
        }
      } catch (jsonErr) {
        console.error('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', jsonErr);
      }
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin initialized successfully with Service Account Key.');
    } else if (
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_PRIVATE_KEY.trim() !== ''
    ) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin initialized successfully with client/private key variables.');
    } else if (process.env.VERCEL) {
      console.warn('Firebase Admin: Running on Vercel but no credentials provided. Skipping initialization.');
    } else {
      // Local/GCP fallback using Application Default Credentials
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const adminApp = getApps().length > 0 ? getApp() : undefined;
adminDb = adminApp ? getFirestore(adminApp) : (null as any);
adminAuth = adminApp ? getAuth(adminApp) : (null as any);

export { adminDb, adminAuth, adminApp };

