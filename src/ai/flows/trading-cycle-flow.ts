'use server';
/**
 * @fileOverview This flow simulates one cycle of the trading bot's heartbeat.
 * It calls the decision flow, logs the reasoning, and executes the trade if necessary.
 */

import { ai } from '@/ai/genkit';
import { tradingDecisionFlow } from './trading-decision-flow';
import type { TradingDecisionInput } from '@/lib/types';
import { Firestore, collection, doc, initializeApp, getFirestore } from 'firebase/firestore';
import { getMarketData, placeTrade, closeTrade } from '@/lib/brokerage-service';
import { addDocumentNonBlocking } from '@/firebase';
import { z } from 'zod';

// FIREBASE CONFIGURATION - ADD THIS
const firebaseConfig = {
  apiKey: "AIzaSyCvI2yX51W2zw3ZPIED4P_e0U-nkMBv2Do",
  authDomain: "studio-2185229754-5b692.firebaseapp.com",
  projectId: "studio-2185229754-5b692",
  storageBucket: "studio-2185229754-5b692.firebasestorage.app",
  messagingSenderId: "872571014730",
  appId: "1:872571014730:web:aa91f023f259d2374220b3"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function logActivity(tradingAccountId: string, userId: string, message: string, type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE' = 'ANALYSIS') {
    const activitiesCollection = collection(firestore, 'users', userId, 'tradingAccounts', tradingAccountId, 'botActivities');
    const activityRef = doc(activitiesCollection);
    addDocumentNonBlocking(activityRef, {
        id: activityRef.id,
        message,
        timestamp: new Date().toISOString(),
        type,
    });
}

// UPDATED INPUT SCHEMA - REMOVE firestore from here
const RunTradingCycleInputSchema = z.object({
  // REMOVED: firestore: z.any(), // No longer needed
  tradingAccountId: z.string(),
  user: z.object({
    uid: z.string(),
    email: z.string().optional(),
  }),
  openTrade: z.any().optional(),
  account: z.object({
    dailyProfitTarget: z.number(),
    dailyRiskLimit: z.number(),
  }),
});

type RunTradingCycleInput = z.infer<typeof RunTradingCycleInputSchema>;

// This is a wrapper flow that orchestrates the decision and execution.
export const runTradingCycleFlow = ai.defineFlow(
  {
    name: 'runTradingCycleFlow',
    inputSchema: RunTradingCycleInputSchema,
    outputSchema: z.void(),
  },
  async (input: RunTradingCycleInput) => {
    // Get parameters from input (firestore is now module-level)
    const { tradingAccountId, user, openTrade, account } = input;
    
    // 1. Log that we are starting the analysis
    await logActivity(tradingAccountId, user.uid, 'Analyzing market data and account status...');

    // Prepare input for tradingDecisionFlow
    const decisionInput = {
      tradingAccountId,
      user,
      openTrade,
      account
    };

    // 2. Call the AI to make a decision
    const decisionResult = await tradingDecisionFlow(decisionInput);
    const { decision, reasoning, tradeDetails } = decisionResult;

    // 3. Log the AI's reasoning
    await logActivity(tradingAccountId, user.uid, `AI Decision: ${decision}. Reasoning: ${reasoning}`, 'SIGNAL');

    // 4. Execute the decision
    switch (decision) {
      case 'OPEN_BUY':
      case 'OPEN_SELL':
        if (tradeDetails && tradeDetails.volume && tradeDetails.confidenceLevel) {
          const marketData = await getMarketData();
          await placeTrade(firestore, user.uid, tradingAccountId, {
            symbol: 'XAUUSDm',
            type: decision === 'OPEN_BUY' ? 'BUY' : 'SELL',
            volume: tradeDetails.volume,
            entryPrice: marketData.price,
            confidenceLevel: tradeDetails.confidenceLevel,
            stopLoss: tradeDetails.stopLoss,
            takeProfit: tradeDetails.takeProfit,
          });
          await logActivity(tradingAccountId, user.uid, `EXECUTION: Placed ${decision} order for ${tradeDetails.volume} lots. SL: ${tradeDetails.stopLoss}, TP: ${tradeDetails.takeProfit}`, 'RESULT');
        } else {
            await logActivity(tradingAccountId, user.uid, `WARNING: AI decided to open but provided no details.`, 'UPDATE');
        }
        break;

      case 'CLOSE':
        if (openTrade) {
          const marketData = await getMarketData();
          const profit = (marketData.price - openTrade.entryPrice) * (openTrade.type === 'SELL' ? -1 : 1) * openTrade.volume * 100;
          await closeTrade(firestore, user.uid, tradingAccountId, openTrade, marketData.price, profit);
          await logActivity(tradingAccountId, user.uid, `EXECUTION: Closed trade for P/L: $${profit.toFixed(2)}`, 'RESULT');
        } else {
            await logActivity(tradingAccountId, user.uid, `WARNING: AI decided to close but there was no open trade.`, 'UPDATE');
        }
        break;

      case 'WAIT':
        // No action needed, the reasoning is already logged.
        break;
    }
  }
);

// Helper function for backward compatibility
export async function runTradingCycle(input: RunTradingCycleInput) {
  return runTradingCycleFlow(input);
}
