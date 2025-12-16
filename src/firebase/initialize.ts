'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration from your config.ts
const firebaseConfig = {
  apiKey: "AIzaSyCvI2yX51WZzw3ZPIED4P_e0U-nkMBv2Do",
  authDomain: "studio-2185229754-5b692.firebaseapp.com",
  databaseURL: "https://studio-2185229754-5b692-default-rtdb.firebaseio.com",
  projectId: "studio-2185229754-5b692",
  storageBucket: "studio-2185229754-5b692.firebasestorage.app",
  messagingSenderId: "872571014730",
  appId: "1:872571014730:web:aa91f023f259d2374220b3"
};

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Initialize Firebase services
export function initializeFirebase(): FirebaseServices {
  // Prevent re-initialization in development (Hot Module Replacement)
  const existingApp = getApps().length > 0 ? getApp() : null;
  
  if (existingApp) {
    console.log('🔥 Firebase already initialized, reusing existing app');
    return {
      firebaseApp: existingApp,
      firestore: getFirestore(existingApp),
      auth: getAuth(existingApp),
    };
  }

  // Initialize new Firebase app
  console.log('🔥 Initializing Firebase app...');
  const firebaseApp = initializeApp(firebaseConfig);
  
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  
  // Log for debugging
  if (typeof window !== 'undefined') {
    console.log('🔥 Firebase initialized on client');
  } else {
    console.log('🔥 Firebase initialized on server');
  }
  
  return {
    firebaseApp,
    firestore,
    auth,
  };
}

// For backward compatibility
export function getSdks() {
  const services = initializeFirebase();
  return services;
}
