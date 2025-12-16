'use server';
/**
 * @fileOverview This flow simulates one cycle of the trading bot's heartbeat.
 * It calls the decision flow, logs the reasoning, and executes the trade if necessary.
 */

import { ai } from '@/ai/genkit';
import { tradingDecisionFlow } from './trading-decision-flow';
import type { TradingDecisionInput } from '@/lib/types';
import { Firestore, collection, doc } from 'firebase/firestore';
import { getMarketData, placeTrade, closeTrade } from '@/lib/brokerage-service';
import { addDocumentNonBlocking, getSdks } from '@/firebase';
import { z } from 'zod';

// Helper function to get firestore for server actions
async function getFirestoreServer() {
  try {
    // Try to get firestore from SDKs
    const { firestore } = getSdks();
    return firestore;
  } catch (error) {
    console.error("Failed to get firestore from SDKs:", error);
    throw new Error("Firestore initialization failed. Make sure Firebase is properly configured.");
  }
}

async function logActivity(firestore: Firestore, tradingAccountId: string, userId: string, message: string, type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE' = 'ANALYSIS') {
    try {
        const activitiesCollection = collection(firestore, 'users', userId, 'tradingAccounts', tradingAccountId, 'botActivities');
        const activityRef = doc(activitiesCollection);
        addDocumentNonBlocking(activityRef, {
            id: activityRef.id,
            message,
            timestamp: new Date().toISOString(),
            type,
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

// Create a new input schema that includes firestore
const RunTradingCycleInputSchema = z.object({
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
    // Get firestore for server actions
    const firestore = await getFirestoreServer();
    
    // Get parameters from input
    const { tradingAccountId, user, openTrade, account } = input;
    
    // 1. Log that we are starting the analysis
    await logActivity(firestore, tradingAccountId, user.uid, 'Analyzing market data and account status...');

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
    await logActivity(firestore, tradingAccountId, user.uid, `AI Decision: ${decision}. Reasoning: ${reasoning}`, 'SIGNAL');

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
          await logActivity(firestore, tradingAccountId, user.uid, `EXECUTION: Placed ${decision} order for ${tradeDetails.volume} lots. SL: ${tradeDetails.stopLoss}, TP: ${tradeDetails.takeProfit}`, 'RESULT');
        } else {
            await logActivity(firestore, tradingAccountId, user.uid, `WARNING: AI decided to open but provided no details.`, 'UPDATE');
        }
        break;

      case 'CLOSE':
        if (openTrade) {
          const marketData = await getMarketData();
          const profit = (marketData.price - openTrade.entryPrice) * (openTrade.type === 'SELL' ? -1 : 1) * openTrade.volume * 100;
          await closeTrade(firestore, user.uid, tradingAccountId, openTrade, marketData.price, profit);
          await logActivity(firestore, tradingAccountId, user.uid, `EXECUTION: Closed trade for P/L: $${profit.toFixed(2)}`, 'RESULT');
        } else {
            await logActivity(firestore, tradingAccountId, user.uid, `WARNING: AI decided to close but there was no open trade.`, 'UPDATE');
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
