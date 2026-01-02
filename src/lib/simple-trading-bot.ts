import { Firestore, collection, doc, setDoc } from 'firebase/firestore';
import { sendTradeCommand } from './command-queue';
import { getTechnicalIndicators, placeTradeInFirestore, closeTradeInFirestore } from './brokerage-service';

export async function runSimpleTradingCycle(
  firestore: Firestore,
  userId: string,
  tradingAccountId: string,
  tradingAccount: any,
  openTrade: any
): Promise<void> {
  try {
    // Log start of cycle
    await logBotActivity(firestore, userId, tradingAccountId, 'Starting trading cycle...');
    
    // Get market data
    const marketData = await getTechnicalIndicators();
    
    // Simple trading logic
    if (!openTrade) {
      // No open trade - check for entry
      const shouldEnter = checkEntryConditions(marketData);
      
      if (shouldEnter) {
        const tradeDetails = calculateTradeDetails(marketData, tradingAccount);
        
        // Log trade in Firestore
        const tradeId = await placeTradeInFirestore(firestore, userId, tradingAccountId, {
          symbol: 'XAUUSD',
          type: tradeDetails.type,
          volume: tradeDetails.volume,
          entryPrice: marketData.price,
          confidenceLevel: tradeDetails.confidence,
          stopLoss: tradeDetails.stopLoss,
          takeProfit: tradeDetails.takeProfit,
        });
        
        // Send command to MT5 bridge
        await sendTradeCommand(firestore, {
          action: 'OPEN',
          details: {
            symbol: 'XAUUSD',
            volume: tradeDetails.volume,
            type: tradeDetails.type,
            stopLoss: tradeDetails.stopLoss,
            takeProfit: tradeDetails.takeProfit,
            firestoreTradeId: tradeId,
          },
        });
        
        await logBotActivity(firestore, userId, tradingAccountId, 
          `Opened ${tradeDetails.type} trade: ${tradeDetails.volume} lots @ $${marketData.price.toFixed(2)}`);
      } else {
        await logBotActivity(firestore, userId, tradingAccountId, 
          'No entry signal. Waiting for better setup...');
      }
    } else {
      // We have an open trade - check for exit
      const shouldExit = checkExitConditions(marketData, openTrade);
      
      if (shouldExit) {
        const profit = calculateProfit(openTrade, marketData.price);
        
        // Close trade in Firestore
        await closeTradeInFirestore(firestore, userId, tradingAccountId, openTrade, marketData.price, profit);
        
        // Send command to MT5 bridge
        await sendTradeCommand(firestore, {
          action: 'CLOSE',
          details: {
            firestoreTradeId: openTrade.id,
          },
        });
        
        await logBotActivity(firestore, userId, tradingAccountId, 
          `Closed trade: P/L $${profit.toFixed(2)}`);
      } else {
        await logBotActivity(firestore, userId, tradingAccountId, 
          `Trade running: ${openTrade.type} @ $${openTrade.entryPrice}, Current: $${marketData.price.toFixed(2)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Trading cycle error:', error);
    await logBotActivity(firestore, userId, tradingAccountId, 
      `Error in trading cycle: ${error.message}`);
  }
}

// Simple entry conditions
function checkEntryConditions(marketData: any): boolean {
  // Simple moving average crossover
  if (marketData.ema9 > marketData.ema21 && marketData.rsi > 50 && marketData.rsi < 70) {
    return true; // Bullish
  }
  if (marketData.ema9 < marketData.ema21 && marketData.rsi < 50 && marketData.rsi > 30) {
    return true; // Bearish
  }
  return false;
}

// Simple exit conditions
function checkExitConditions(marketData: any, openTrade: any): boolean {
  // Exit if RSI goes extreme
  if (openTrade.type === 'BUY' && marketData.rsi > 70) return true;
  if (openTrade.type === 'SELL' && marketData.rsi < 30) return true;
  
  // Exit if price hits stop loss or take profit
  if (openTrade.stopLoss && openTrade.takeProfit) {
    if (openTrade.type === 'BUY') {
      if (marketData.price <= openTrade.stopLoss || marketData.price >= openTrade.takeProfit) return true;
    } else {
      if (marketData.price >= openTrade.stopLoss || marketData.price <= openTrade.takeProfit) return true;
    }
  }
  
  return false;
}

function calculateTradeDetails(marketData: any, account: any) {
  const type = marketData.ema9 > marketData.ema21 ? 'BUY' : 'SELL';
  const volume = Math.min(0.1, account.maxPositionSize || 0.1); // Fixed 0.1 lot for now
  
  // Calculate SL/TP based on ATR
  const atrMultiplier = 1.5;
  const tpMultiplier = 2.0;
  
  if (type === 'BUY') {
    return {
      type,
      volume,
      confidence: 'Moderate',
      stopLoss: marketData.price - (marketData.atr * atrMultiplier),
      takeProfit: marketData.price + (marketData.atr * tpMultiplier),
    };
  } else {
    return {
      type,
      volume,
      confidence: 'Moderate',
      stopLoss: marketData.price + (marketData.atr * atrMultiplier),
      takeProfit: marketData.price - (marketData.atr * tpMultiplier),
    };
  }
}

function calculateProfit(openTrade: any, currentPrice: number): number {
  const priceDifference = currentPrice - openTrade.entryPrice;
  const profit = priceDifference * (openTrade.type === 'SELL' ? -1 : 1) * openTrade.volume * 100;
  return Number(profit.toFixed(2));
}

async function logBotActivity(
  firestore: Firestore,
  userId: string,
  tradingAccountId: string,
  message: string,
  type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE' = 'UPDATE'
): Promise<void> {
  try {
    const activitiesCollection = collection(
      firestore,
      'users',
      userId,
      'tradingAccounts',
      tradingAccountId,
      'botActivities'
    );
    
    const activityRef = doc(activitiesCollection);
    
    await setDoc(activityRef, {
      id: activityRef.id,
      message,
      timestamp: new Date().toISOString(),
      type,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
