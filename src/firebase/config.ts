import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvI2yX51WZzw3ZPIED4P_e0U-nkMBv2Do",
  authDomain: "studio-2185229754-5b692.firebaseapp.com",
  databaseURL: "https://studio-2185229754-5b692-default-rtdb.firebaseio.com",
  projectId: "studio-2185229754-5b692",
  storageBucket: "studio-2185229754-5b692.firebasestorage.app",
  messagingSenderId: "872571014730",
  appId: "1:872571014730:web:aa91f023f259d2374220b3"
};

// Initialize Firebase only once
let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

// Server-safe initialization
if (typeof window === 'undefined') {
  // Server-side: Always initialize
  firebaseApp = initializeApp(firebaseConfig);
  firestore = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  console.log('🔥 Firebase initialized on server');
} else {
  // Client-side: Check if already initialized
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized on client');
  } else {
    firebaseApp = getApp();
    console.log('🔥 Firebase already initialized on client, reusing');
  }
  firestore = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
}

// Export initialized services
export { firebaseApp as app, firestore, auth };

// For backward compatibility
export function getSdks() {
  return {
    firestore,
    auth,
    app: firebaseApp,
  };
}
