'use server';
/**
 * @fileOverview The core AI trading brain. Decides whether to open, close, or hold a position.
 *
 * - tradingDecisionFlow - The main flow that makes the trading decision.
 */

import { ai } from '@/ai/genkit';
import { getMarketData, getTechnicalIndicators } from '@/lib/brokerage-service';
import { TradingDecisionInputSchema, TradingDecisionOutputSchema, TradingDecisionPromptInputSchema } from '@/lib/types';
import type { TradingDecisionInput, TradingDecisionOutput } from '@/lib/types';


const decisionPrompt = ai.definePrompt({
    name: 'tradingDecisionPrompt',
    input: { schema: TradingDecisionPromptInputSchema },
    output: { schema: TradingDecisionOutputSchema },
    prompt: `You are an expert AI trading bot for Gold (XAUUSD) following a "Momentum Crossover Strategy". It is currently {{currentTime}}.

    Your goal is to manage one trade at a time to hit a daily profit target of \${{account.dailyProfitTarget}} while not exceeding a daily risk limit of \${{account.dailyRiskLimit}}.

    ## Strategy Rules (MUST FOLLOW)
    1.  **Bullish Entry (OPEN_BUY):**
        - The 9-period EMA MUST be above the 21-period EMA.
        - The RSI(14) MUST be above 50 but below 70 (strong, but not overbought).
        - There must be NO open trade.

    2.  **Bearish Entry (OPEN_SELL):**
        - The 9-period EMA MUST be below the 21-period EMA.
        - The RSI(14) MUST be below 50 but above 30 (strong, but not oversold).
        - There must be NO open trade.
        
    3.  **Exit Condition (CLOSE):**
        - A trade is open AND the RSI(14) crosses back over 70 (for a BUY) or under 30 (for a SELL).
        - OR the price hits the Take Profit or Stop Loss level.

    4.  **Hold/Wait (WAIT):**
        - If none of the above entry or exit conditions are met.

    ## Live Market Analysis
    - Current Price: \${{marketData.price}}
    - 9-period EMA: \${{marketData.ema9}}
    - 21-period EMA: \${{marketData.ema21}}
    - RSI(14): {{marketData.rsi}}
    - ATR(14) for Risk: \${{marketData.atr}}

    ## Current Account State
    - Today's P/L: \${{account.todaysPnL}}
    - Open Trade: {{#if openTrade}}A {{openTrade.type}} trade opened at \${{openTrade.entryPrice}} running for {{openTrade.durationMinutes}} minutes. Current unrealized P/L is \${{openTrade.unrealizedPnL}}.{{else}}None{{/if}}

    ## Your Task
    Based STRICTLY on the rules above, decide the SINGLE best action to take: OPEN_BUY, OPEN_SELL, CLOSE, or WAIT.
    
    If opening a trade, you MUST calculate the Stop Loss and Take Profit using the ATR:
    - **Stop Loss:**
        - For BUY: Entry Price - (1.5 * ATR)
        - For SELL: Entry Price + (1.5 * ATR)
    - **Take Profit:**
        - For BUY: Entry Price + (2.0 * ATR)
        - For SELL: Entry Price - (2.0 * ATR)
    - You must also specify a sensible trade volume and confidence level.
    `,
});


export const tradingDecisionFlow = ai.defineFlow(
  {
    name: 'tradingDecisionFlow',
    inputSchema: TradingDecisionInputSchema,
    outputSchema: TradingDecisionOutputSchema,
  },
  async (input): Promise<TradingDecisionOutput> => {
    const marketData = await getTechnicalIndicators();

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
      ...input,
      marketData,
      openTrade: openTradeWithContext,
      account: { ...input.account, todaysPnL },
      currentTime: new Date().toLocaleTimeString(),
    });

    return output!;
  }
);
