import { Firestore, doc, setDoc, updateDoc, collection } from 'firebase/firestore';

// Mock market data - replace with real API later
export async function getTechnicalIndicators() {
  // In real implementation, fetch from MT5 or market API
  return {
    price: 2350.50, // Example XAUUSD price
    ema9: 2348.20,
    ema21: 2345.80,
    rsi: 58.5,
    atr: 12.3,
    timestamp: new Date().toISOString(),
  };
}

export async function placeTradeInFirestore(
  firestore: Firestore,
  userId: string,
  tradingAccountId: string,
  tradeData: {
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    entryPrice: number;
    confidenceLevel?: string;
    stopLoss?: number;
    takeProfit?: number;
  }
): Promise<string> {
  try {
    const tradesCollection = collection(
      firestore, 
      'users', 
      userId, 
      'tradingAccounts', 
      tradingAccountId, 
      'trades'
    );
    
    const tradeRef = doc(tradesCollection);
    
    const trade = {
      id: tradeRef.id,
      tradingAccountId,
      timestamp: new Date().toISOString(),
      symbol: tradeData.symbol,
      type: tradeData.type,
      entryPrice: tradeData.entryPrice,
      volume: tradeData.volume,
      confidenceLevel: tradeData.confidenceLevel || 'Moderate',
      status: 'OPEN',
      stopLoss: tradeData.stopLoss,
      takeProfit: tradeData.takeProfit,
    };
    
    await setDoc(tradeRef, trade);
    console.log(`✅ Trade logged in Firestore: ${tradeRef.id}`);
    return tradeRef.id;
  } catch (error) {
    console.error('❌ Failed to log trade in Firestore:', error);
    throw error;
  }
}

export async function closeTradeInFirestore(
  firestore: Firestore,
  userId: string,
  tradingAccountId: string,
  trade: any,
  exitPrice: number,
  profit: number
): Promise<void> {
  try {
    const tradeRef = doc(
      firestore,
      'users',
      userId,
      'tradingAccounts',
      tradingAccountId,
      'trades',
      trade.id
    );
    
    await updateDoc(tradeRef, {
      exitPrice,
      profit,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Trade closed in Firestore: ${trade.id}, Profit: $${profit}`);
  } catch (error) {
    console.error('❌ Failed to close trade in Firestore:', error);
    throw error;
  }
}
