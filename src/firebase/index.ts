// Re-export everything from provider
export * from './provider';
export * from './client-provider';

// Core Firebase services
export { app, firestore, auth, getSdks } from './config';

// Hook exports for backward compatibility
export { 
  useFirebase, 
  useAuth, 
  useFirestore, 
  useFirebaseApp, 
  useUser,
  useMemoFirebase 
} from './provider';

// Firestore hooks (you need to create these)
export { 
  useCollection, 
  useDoc, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from './firestore-hooks';
