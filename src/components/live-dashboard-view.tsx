const tradesQuery = useMemoFirebase(() => {
  if (!user || !tradingAccount || !firestore) return null;
  
  try {
    return query(
      collection(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id, 'trades'),
      orderBy('timestamp', 'desc')
    );
  } catch (error) {
    console.error('Error creating trades query:', error);
    return null;
  }
}, [firestore, user, tradingAccount]);

const botActivitiesCollection = useMemoFirebase(() => {
  if (!user || !tradingAccount || !firestore) return null;
  
  try {
    return collection(firestore, 'users', user.uid, 'tradingAccounts', tradingAccount.id, 'botActivities');
  } catch (error) {
    console.error('Error creating bot activities collection:', error);
    return null;
  }
}, [firestore, user, tradingAccount]);
