'use server';

import { doc, setDoc, collection } from 'firebase/firestore';
import { app, firestore, auth } from '@/firebase/config';

export async function initializeUserData(userId: string, userEmail: string) {
  try {
    console.log('Initializing user data for:', userId);
    
    // Create user document
    const userDoc = doc(firestore, 'users', userId);
    await setDoc(userDoc, {
      email: userEmail,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tradingAccounts: []
    }, { merge: true });
    
    // Create default trading account
    const tradingAccountRef = doc(collection(firestore, 'users', userId, 'tradingAccounts'));
    const defaultAccount = {
      id: tradingAccountRef.id,
      userProfileId: userId,
      broker: 'Exness',
      accountNumber: '261813562',
      startingBalance: 10000,
      currentBalance: 10000,
      dailyProfitTarget: 1000,
      dailyRiskLimit: 500,
      autoTradingActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(tradingAccountRef, defaultAccount);
    
    console.log('User data initialized successfully');
    return { success: true, accountId: tradingAccountRef.id };
    
  } catch (error) {
    console.error('Error initializing user data:', error);
    return { success: false, error: String(error) };
  }
}
