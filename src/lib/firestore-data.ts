import { Firestore, doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export async function createInitialUserData(
  firestore: Firestore,
  user: User,
  firstName: string,
  lastName: string
): Promise<void> {
  try {
    // Create user profile
    const userProfileRef = doc(firestore, 'users', user.uid);
    
    const referralCode = generateReferralCode();
    
    await setDoc(userProfileRef, {
      id: user.uid,
      email: user.email,
      firstName,
      lastName,
      referralCode,
      virtualBalance: 10000, // Starting demo balance
      createdAt: new Date().toISOString(),
    });
    
    // Create default trading account
    const tradingAccountsCollection = collection(firestore, 'users', user.uid, 'tradingAccounts');
    const tradingAccountRef = doc(tradingAccountsCollection);
    
    await setDoc(tradingAccountRef, {
      id: tradingAccountRef.id,
      userProfileId: user.uid,
      startingBalance: 10000,
      currentBalance: 10000,
      dailyRiskLimit: 500,
      dailyProfitTarget: 1000,
      maxPositionSize: 1.0,
      autoTradingActive: false,
      createdAt: new Date().toISOString(),
    });
    
    console.log(`✅ User data created for: ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to create user data:', error);
    throw error;
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${result}`;
}
