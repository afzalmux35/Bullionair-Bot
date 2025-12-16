'use client';

import { useState, useEffect, useMemo } from 'react'; // Add useMemo here
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
  
  // REPLACE useMemoFirebase with regular useMemo
  const tradingAccountsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    
    try {
      const collectionRef = collection(firestore, 'users', user.uid, 'tradingAccounts');
      return query(collectionRef, where('userProfileId', '==', user.uid));
    } catch (error) {
      console.error('Error creating query:', error);
      return null;
    }
  }, [firestore, user]); // Remove useMemoFirebase dependency

  const { data: tradingAccounts, isLoading: isLoadingAccounts } = useCollection<TradingAccount>(tradingAccountsQuery);

  const [tradingAccount, setTradingAccount] = useState<TradingAccount | undefined>(tradingAccounts?.[0]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | undefined>();

  useEffect(() => {
    if (tradingAccounts && tradingAccounts.length > 0) {
      const activeAccount = tradingAccounts[0];
      setTradingAccount(activeAccount);
      
      if (!dailyGoal) {
        setDailyGoal({ 
          type: 'profit', 
          value: activeAccount.dailyProfitTarget || 1000 
        });
      }
      
      if (activeAccount.autoTradingActive) {
        setTradingActive(true);
      }
    }
  }, [tradingAccounts, dailyGoal]);

  const [isTradingActive, setTradingActive] = useState(tradingAccount?.autoTradingActive || false);

  const handleStartTrading = (goal: DailyGoal, confirmation: string) => {
    if (!user || !tradingAccount || !firestore) return;
    
    try {
      const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
      const updateData = {
        autoTradingActive: true,
        dailyProfitTarget: goal.type === 'profit' ? goal.value : tradingAccount.dailyProfitTarget,
        dailyRiskLimit: goal.type === 'risk' ? goal.value : tradingAccount.dailyRiskLimit,
      };
      
      setDocumentNonBlocking(accountRef, updateData, { merge: true });
      setTradingAccount(prev => prev ? { ...prev, ...updateData } : undefined);
      setDailyGoal(goal);
      setTradingActive(true);
    } catch (error) {
      console.error('Error starting trading:', error);
    }
  };

  const handlePauseTrading = () => {
    if (!user || !tradingAccount || !firestore) return;
    
    try {
      const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
      setDocumentNonBlocking(accountRef, { autoTradingActive: false }, { merge: true });
      setTradingAccount(prev => prev ? { ...prev, autoTradingActive: false } : undefined);
      setTradingActive(false);
    } catch (error) {
      console.error('Error pausing trading:', error);
    }
  };

  if (isLoadingAccounts) {
    return <Skeleton className="h-[400px] w-full" />;
  }

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
