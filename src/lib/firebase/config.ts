import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-key-for-build-prerendering',
  authDomain: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-auth-domain',
  projectId: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-project-id',
  storageBucket: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-storage-bucket',
  messagingSenderId: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-sender-id',
  appId: (import.meta.env.VITE_UNUSED as string | undefined) || 'dummy-app-id',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const isFirebaseConfigured = Boolean(
  (import.meta.env.VITE_UNUSED as string | undefined) &&
  (import.meta.env.VITE_UNUSED as string | undefined) !== 'dummy-key-for-build-prerendering'
);

export { app, auth, db, storage, isFirebaseConfigured };
