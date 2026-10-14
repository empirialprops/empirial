import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// Public Firebase web config (safe to ship in the browser).
const firebaseConfig = {
  apiKey: 'AIzaSyCe9uxipeZcMDbMMMc2h4j7EuaADRfO7Dc',
  authDomain: 'goal-planner-3802e.firebaseapp.com',
  projectId: 'goal-planner-3802e',
  storageBucket: 'goal-planner-3802e.firebasestorage.app',
  messagingSenderId: '848052161618',
  appId: '1:848052161618:web:68450bf3b90ea3f789238b',
  measurementId: 'G-B9P8R3PHCB',
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const isFirebaseConfigured = true;

export { app, auth, db, storage, isFirebaseConfigured };
