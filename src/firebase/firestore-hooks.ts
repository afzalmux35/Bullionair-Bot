'use client';

import { 
  collection, 
  doc, 
  query, 
  Query, 
  DocumentReference,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useFirestore } from './provider';

// Collection hook
export function useCollection<T>(q: Query | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q || !firestore) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q, firestore]);

  return { data, isLoading, error };
}

// Document hook
export function useDoc<T>(docRef: DocumentReference | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef || !firestore) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as T : null);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, firestore]);

  return { data, isLoading, error };
}

// Non-blocking document operations
export async function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
  options?: { merge?: boolean }
) {
  try {
    await setDoc(docRef, data, options);
    return { success: true };
  } catch (error) {
    console.error('Error setting document:', error);
    return { success: false, error };
  }
}

export async function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any
) {
  try {
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error };
  }
}
