'use client';

import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import type { Trade } from './types';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

export type MarketData = {
  price: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
};

/**
 * Simulates fetching live market data for gold (XAU/USD).
 * In a real application, this would connect to a live data feed.
 */
export function getMarketData(): MarketData {
  // Simulate price fluctuations and trend changes
  const basePrice = 1950;
  const price = basePrice + Math.random() * 20 - 10;
  const trendRoll = Math.random();
  const trend = trendRoll < 0.4 ? 'UP' : trendRoll < 0.8 ? 'DOWN' : 'SIDEWAYS';
  return { price, trend };
}

/**
 * Simulates placing a new trade with a brokerage.
 * In a real application, this would call the brokerage's API.
 * For now, it creates a new "OPEN" trade in Firestore.
 */
export async function placeTrade(
  firestore: Firestore,
  userId: string,
  tradingAccountId: string,
  tradeDetails: {
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    entryPrice: number;
    confidenceLevel: string;
  }
): Promise<string> {
    const tradesCollection = collection(firestore, 'users', userId, 'tradingAccounts', tradingAccountId, 'trades');
    const newTradeRef = doc(tradesCollection);

    const newTrade: Trade = {
        id: newTradeRef.id,
        tradingAccountId,
        timestamp: new Date().toISOString(),
        status: 'OPEN',
        ...tradeDetails,
        profit: 0, // No profit on an open trade
    };

    setDocumentNonBlocking(newTradeRef, newTrade, { merge: false });
    return newTradeRef.id;
}


/**
 * Simulates closing an existing trade.
 * In a real application, this would call the brokerage's API.
 * For now, it updates the trade's status and profit in Firestore.
 */
export function closeTrade(
    firestore: Firestore,
    userId: string,
    tradingAccountId: string,
    tradeId: string,
    exitPrice: number,
    profit: number
) {
    const tradeRef = doc(firestore, 'users', userId, 'tradingAccounts', tradingAccountId, 'trades', tradeId);
    
    const tradeStatus = profit >= 0 ? 'WON' : 'LOST';

    updateDocumentNonBlocking(tradeRef, {
        exitPrice,
        profit,
        status: tradeStatus,
    });
}
