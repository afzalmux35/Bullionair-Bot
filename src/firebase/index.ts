// src/firebase/index.ts

// Re-export everything from initialize
export { initializeFirebase, getSdks } from './initialize';

// Re-export everything from provider
export * from './provider';
export * from './client-provider';

// Re-export Firestore hooks
export { 
  useCollection, 
  useDoc, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from './firestore-hooks';

// Re-export core Firebase instances
export { app, firestore, auth } from './config';

// ⚠️ IMPORTANT: Export useMemoFirebase
export { useMemoFirebase } from './provider';
