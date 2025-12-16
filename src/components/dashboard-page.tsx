'use client';

import { useState, useEffect, useMemo } from 'react'; // ✅ ADD useMemo HERE
import { DailyConfigForm } from '@/components/daily-config-form';
import { LiveDashboardView } from '@/components/live-dashboard-view';
import { PerformanceReview } from '@/components/performance-review';
import type { DailyGoal, TradingAccount } from '@/lib/types';
import { Separator } from './ui/separator';
import { useCollection, useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

export function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // ✅ CORRECT: useMemo imported from React
  const tradingAccountsQuery = useMemo(() => {
    if (!user || !firestore) {
      console.log('No user or firestore for query');
      return null;
    }
    
    try {
      console.log('Creating query for user:', user.uid);
      const collectionRef = collection(firestore, 'users', user.uid, 'tradingAccounts');
      return query(collectionRef, where('userProfileId', '==', user.uid));
    } catch (error) {
      console.error('Error creating query:', error);
      return null;
    }
  }, [firestore, user]);

  const { data: tradingAccounts, isLoading: isLoadingAccounts } = useCollection<TradingAccount>(tradingAccountsQuery);

  // ✅ TEMPORARY: Use mock data if no Firestore data
  const mockTradingAccount: TradingAccount = {
    id: 'mock-account-123',
    userProfileId: user?.uid || 'mock-user',
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

  const [tradingAccount, setTradingAccount] = useState<TradingAccount | undefined>(
    tradingAccounts?.[0] || mockTradingAccount
  );
  
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | undefined>();

  useEffect(() => {
    console.log('Trading accounts loaded:', tradingAccounts);
    
    if (tradingAccounts && tradingAccounts.length > 0) {
      const activeAccount = tradingAccounts[0];
      console.log('Setting active account:', activeAccount);
      setTradingAccount(activeAccount);
      
      if (!dailyGoal) {
        setDailyGoal({ 
          type: 'profit', 
          value: activeAccount.dailyProfitTarget || 1000 
        });
      }
      
      if (activeAccount.autoTradingActive) {
        console.log('Account has auto trading active');
      }
    } else {
      console.log('Using mock trading account');
    }
  }, [tradingAccounts, dailyGoal]);

  const [isTradingActive, setTradingActive] = useState(
    tradingAccount?.autoTradingActive || false
  );

  const handleStartTrading = async (goal: DailyGoal, confirmation: string) => {
    console.log('🚀 Starting trading with goal:', goal);
    console.log('User:', user?.uid);
    console.log('Trading Account:', tradingAccount?.id);
    
    if (!user || !tradingAccount || !firestore) {
      console.error('Missing required data for starting trading');
      return;
    }
    
    try {
      console.log('Updating Firestore...');
      const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
      const updateData = {
        autoTradingActive: true,
        dailyProfitTarget: goal.type === 'profit' ? goal.value : tradingAccount.dailyProfitTarget,
        dailyRiskLimit: goal.type === 'risk' ? goal.value : tradingAccount.dailyRiskLimit,
      };
      
      console.log('Update data:', updateData);
      await setDocumentNonBlocking(accountRef, updateData, { merge: true });
      
      setTradingAccount(prev => prev ? { ...prev, ...updateData } : undefined);
      setDailyGoal(goal);
      setTradingActive(true);
      
      console.log('✅ Trading started successfully!');
      
    } catch (error) {
      console.error('❌ Error starting trading:', error);
    }
  };

  const handlePauseTrading = () => {
    console.log('⏸️ Pausing trading...');
    
    if (!user || !tradingAccount || !firestore) {
      console.error('Missing required data for pausing trading');
      return;
    }
    
    try {
      const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
      setDocumentNonBlocking(accountRef, { autoTradingActive: false }, { merge: true });
      setTradingAccount(prev => prev ? { ...prev, autoTradingActive: false } : undefined);
      setTradingActive(false);
      
      console.log('✅ Trading paused successfully!');
    } catch (error) {
      console.error('❌ Error pausing trading:', error);
    }
  };

  if (isLoadingAccounts) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  console.log('Rendering dashboard:', {
    hasUser: !!user,
    hasTradingAccount: !!tradingAccount,
    isTradingActive,
    dailyGoal
  });

  return (
    <div className="flex flex-col gap-8">
      {!isTradingActive ? (
        <DailyConfigForm onStartTrading={handleStartTrading} />
      ) : (
        tradingAccount && dailyGoal && 
        <LiveDashboardView 
          dailyGoal={dailyGoal}  
          onPause={handlePauseTrading} 
          tradingAccount={tradingAccount}
        />
      )}
      <Separator />
      <PerformanceReview />
    </div>
  );
}
