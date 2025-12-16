'use server';
/**
 * @fileOverview This flow simulates one cycle of the trading bot's heartbeat.
 * It calls the decision flow, logs the reasoning, and executes the trade if necessary.
 */

import { ai } from '@/ai/genkit';
import { tradingDecisionFlow } from './trading-decision-flow';
import type { TradingDecisionInput } from '@/lib/types';
import { getMarketData, placeTrade, closeTrade } from '@/lib/brokerage-service';
import { z } from 'zod';

// This is a wrapper flow that orchestrates the decision and execution.
export const runTradingCycleFlow = ai.defineFlow(
  {
    name: 'runTradingCycleFlow',
    inputSchema: z.any(),
    outputSchema: z.void(),
  },
  async (input: TradingDecisionInput) => {
    // Get parameters from input
    const { tradingAccountId, user, openTrade, account } = input;
    
    // 2. Call the AI to make a decision
    const decisionResult = await tradingDecisionFlow(input);
    const { decision, reasoning, tradeDetails } = decisionResult;

    // 3. Execute the decision
    switch (decision) {
      case 'OPEN_BUY':
      case 'OPEN_SELL':
        if (tradeDetails && tradeDetails.volume && tradeDetails.confidenceLevel) {
          const marketData = await getMarketData();
          await placeTrade({
            symbol: 'XAUUSDm',
            type: decision === 'OPEN_BUY' ? 'BUY' : 'SELL',
            volume: tradeDetails.volume,
            entryPrice: marketData.price,
            confidenceLevel: tradeDetails.confidenceLevel,
            stopLoss: tradeDetails.stopLoss,
            takeProfit: tradeDetails.takeProfit,
          });
        }
        break;

      case 'CLOSE':
        if (openTrade) {
          const marketData = await getMarketData();
          const profit = (marketData.price - openTrade.entryPrice) * (openTrade.type === 'SELL' ? -1 : 1) * openTrade.volume * 100;
          await closeTrade(openTrade, marketData.price, profit);
        }
        break;

      case 'WAIT':
        // No action needed
        break;
    }
  }
);

// Helper function for backward compatibility
export async function runTradingCycle(input: TradingDecisionInput) {
  return runTradingCycleFlow(input);
}
