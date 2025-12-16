// src/firebase/index.ts
// SIMPLIFIED VERSION - EXPORTS EVERYTHING YOU NEED

// Core Firebase services
export { app, firestore, auth, getSdks } from './config';

// Firebase initialization
export { initializeFirebase } from './initialize';

// React Context Provider
export { FirebaseClientProvider } from './client-provider';

// React Hooks from provider
export { 
  useFirebase,
  useAuth,
  useFirestore,
  useFirebaseApp,
  useUser
} from './provider';

// Firestore data hooks
export { 
  useCollection, 
  useDoc, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from './firestore-hooks';

// For backward compatibility - re-export everything from provider
export * from './provider';
