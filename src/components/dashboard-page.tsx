'use client';

import { useState } from 'react';
import { DailyConfigForm } from '@/components/daily-config-form';
import { LiveDashboardView } from '@/components/live-dashboard-view';
import { PerformanceReview } from '@/components/performance-review';
import type { DailyGoal, TradingAccount } from '@/lib/types';
import { Separator } from './ui/separator';
import { useCollection, useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';

export function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const tradingAccountsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'tradingAccounts'), where('userProfileId', '==', user.uid));
  }, [firestore, user]);

  const { data: tradingAccounts, isLoading: isLoadingAccounts } = useCollection<TradingAccount>(tradingAccountsQuery);

  const tradingAccount = tradingAccounts?.[0];

  const [isTradingActive, setIsTradingActive] = useState(tradingAccount?.autoTradingActive || false);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ type: 'profit', value: tradingAccount?.dailyProfitTarget || 1000 });
  const [confirmationMessage, setConfirmationMessage] = useState('');
  
  const handleStartTrading = (goal: DailyGoal, confirmation: string) => {
    if (!user || !tradingAccount) return;
    const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
    const updateData = {
        autoTradingActive: true,
        dailyProfitTarget: goal.type === 'profit' ? goal.value : tradingAccount.dailyProfitTarget,
        dailyRiskLimit: goal.type === 'risk' ? goal.value : tradingAccount.dailyRiskLimit,
    };
    setDocumentNonBlocking(accountRef, updateData, { merge: true });

    setDailyGoal(goal);
    setConfirmationMessage(confirmation);
    setIsTradingActive(true);
  };
  
  const handlePauseTrading = () => {
    if (!user || !tradingAccount) return;
    const accountRef = doc(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id);
    setDocumentNonBlocking(accountRef, { autoTradingActive: false }, { merge: true });
    setIsTradingActive(false);
  };

  if (isLoadingAccounts) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <div className="flex flex-col gap-8">
      {!isTradingActive ? (
        <DailyConfigForm onStartTrading={handleStartTrading} />
      ) : (
        tradingAccount && <LiveDashboardView dailyGoal={dailyGoal} confirmationMessage={confirmationMessage} onPause={handlePauseTrading} tradingAccountId={tradingAccount.id} />
      )}
      <Separator />
      <PerformanceReview />
    </div>
  );
}
