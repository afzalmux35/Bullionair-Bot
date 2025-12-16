'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';

// Import the initialized instances directly from config
import { app, firestore, auth } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Use memo to prevent re-renders
  const firebaseServices = useMemo(() => ({
    firebaseApp: app,
    firestore,
    auth,
  }), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
