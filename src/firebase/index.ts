import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvI2yX51W2zw3ZPIED4P_e0U-nkMBv2Do",
  authDomain: "studio-2185229754-5b692.firebaseapp.com",
  projectId: "studio-2185229754-5b692",
  storageBucket: "studio-2185229754-5b692.firebasestorage.app",
  messagingSenderId: "872571014730",
  appId: "1:872571014730:web:aa91f023f259d2374220b3"
};

// SERVER-SAFE INITIALIZATION
// This prevents re-initialization and works in both server/client environments
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const auth = getAuth(app);

// Export initialized services
export { app, firestore, auth };

// Helper function to get SDKs (for backward compatibility)
export function getSdks() {
  return {
    firestore,
    auth,
    app
  };
}

// Client-side only hooks (won't run on server)
if (typeof window !== 'undefined') {
  // Client-side specific initialization if needed
  console.log('Firebase initialized on client');
}

// Server-side check
if (typeof window === 'undefined') {
  console.log('Firebase initialized on server');
}
