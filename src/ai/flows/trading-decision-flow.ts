'use server';
/**
 * @fileOverview The core AI trading brain. Decides whether to open, close, or hold a position.
 *
 * - tradingDecisionFlow - The main flow that makes the trading decision.
 * - TradingDecisionInput - The input schema for the flow.
 * - TradingDecisionOutput - The output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMarketData } from '@/lib/brokerage-service';

// Schemas
const TradeSchema = z.object({
    id: z.string(),
    tradingAccountId: z.string(),
    timestamp: z.string(),
    symbol: z.string(),
    type: z.enum(['BUY', 'SELL']),
    entryPrice: z.number(),
    volume: z.number(),
    status: z.enum(['OPEN', 'WON', 'LOST']),
    profit: z.number().optional(),
    exitPrice: z.number().optional(),
    confidenceLevel: z.string(),
});

export const TradingDecisionInputSchema = z.object({
  tradingAccountId: z.string(),
  user: z.object({
    uid: z.string(),
  }),
  openTrade: TradeSchema.optional().nullable(),
  account: z.object({
    currentBalance: z.number(),
    dailyProfitTarget: z.number(),
    dailyRiskLimit: z.number(),
  }),
});
export type TradingDecisionInput = z.infer<typeof TradingDecisionInputSchema>;

export const TradingDecisionOutputSchema = z.object({
  decision: z.enum(['OPEN_BUY', 'OPEN_SELL', 'CLOSE', 'WAIT']),
  reasoning: z.string().describe('Detailed reasoning for the trading decision.'),
  tradeDetails: z.object({
      symbol: z.string().optional(),
      volume: z.number().optional(),
      confidenceLevel: z.string().optional(),
    }).optional(),
});
export type TradingDecisionOutput = z.infer<typeof TradingDecisionOutputSchema>;


const decisionPrompt = ai.definePrompt({
    name: 'tradingDecisionPrompt',
    input: { schema: z.object({
        marketData: z.any(),
        openTrade: TradeSchema.optional().nullable(),
        account: z.any(),
        currentTime: z.string(),
    }) },
    output: { schema: TradingDecisionOutputSchema },
    prompt: `You are an expert AI trading bot for Gold (XAUUSD). It is currently {{currentTime}}.

    Your goal is to manage one trade at a time to hit a daily profit target of \${{account.dailyProfitTarget}} while not exceeding a daily risk limit of \${{account.dailyRiskLimit}}.

    ## Current Market Data
    - Price: \${{marketData.price}}
    - 2-Minute Trend: {{marketData.trend}}

    ## Current Account State
    - Today's P/L: \${{account.todaysPnL}}
    - Open Trade: {{#if openTrade}}A {{openTrade.type}} trade opened at \${{openTrade.entryPrice}} running for {{openTrade.durationMinutes}} minutes. Current unrealized P/L is \${{openTrade.unrealizedPnL}}.{{else}}None{{/if}}

    ## Your Task
    Based on all the data, decide the SINGLE best action to take RIGHT NOW. Your options are:
    1.  **OPEN_BUY**: If there's no open trade and you see a clear bullish setup.
    2.  **OPEN_SELL**: If there's no open trade and you see a clear bearish setup.
    3.  **CLOSE**: If the current open trade should be closed (either to take profit or cut losses).
    4.  **WAIT**: If no clear opportunity exists or it's better to hold the current position.

    Provide detailed reasoning based on the trend, price action, and risk management. If opening a trade, specify volume and confidence.
    `,
});


export const tradingDecisionFlow = ai.defineFlow(
  {
    name: 'tradingDecisionFlow',
    inputSchema: TradingDecisionInputSchema,
    outputSchema: TradingDecisionOutputSchema,
  },
  async (input) => {
    const marketData = await getMarketData();

    let openTradeWithContext = null;
    if (input.openTrade) {
        const unrealizedPnL = (marketData.price - input.openTrade.entryPrice) * (input.openTrade.type === 'SELL' ? -1 : 1) * input.openTrade.volume * 100;
        const durationMinutes = Math.floor((new Date().getTime() - new Date(input.openTrade.timestamp).getTime()) / 60000);
        openTradeWithContext = {
            ...input.openTrade,
            unrealizedPnL: unrealizedPnL.toFixed(2),
            durationMinutes,
        };
    }
    
    // This would be calculated from the day's closed trades.
    const todaysPnL = 0; // Simplified for now

    const { output } = await decisionPrompt({
      marketData,
      openTrade: openTradeWithContext,
      account: { ...input.account, todaysPnL },
      currentTime: new Date().toLocaleTimeString(),
    });

    return output!;
  }
);
