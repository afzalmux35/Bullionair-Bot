'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function TestFirebasePage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isLoading } = useUser();

  useEffect(() => {
    console.log('🔥 Firebase Test Page Loaded');
    console.log('Auth:', auth);
    console.log('Firestore:', firestore);
    console.log('User:', user);
    console.log('Loading:', isLoading);
  }, [auth, firestore, user, isLoading]);

  const testFirestore = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testRef = collection(firestore, 'test');
      const snapshot = await getDocs(testRef);
      console.log('Firestore test successful:', snapshot.empty ? 'No documents' : 'Has documents');
    } catch (error) {
      console.error('Firestore test failed:', error);
    }
  };

  const testAuth = async () => {
    try {
      console.log('Testing Auth...');
      // Just check current user
      console.log('Current user:', auth.currentUser);
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔥 Firebase Connection Test</h1>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Status:</h2>
        <p><strong>Firebase Auth:</strong> {auth ? '✅ Connected' : '❌ Not Connected'}</p>
        <p><strong>Firestore:</strong> {firestore ? '✅ Connected' : '❌ Not Connected'}</p>
        <p><strong>User:</strong> {user ? `✅ Logged in as ${user.email}` : '❌ Not logged in'}</p>
        <p><strong>Loading:</strong> {isLoading ? '🔄 Loading...' : '✅ Ready'}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={testFirestore}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Firestore
        </button>
        
        <button 
          onClick={testAuth}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Auth
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
        <h3>Debug Info:</h3>
        <pre style={{ 
          backgroundColor: '#333', 
          color: '#fff', 
          padding: '1rem',
          borderRadius: '5px',
          overflowX: 'auto'
        }}>
          {JSON.stringify({
            hasAuth: !!auth,
            hasFirestore: !!firestore,
            user: user ? { email: user.email, uid: user.uid } : null,
            isLoading,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
