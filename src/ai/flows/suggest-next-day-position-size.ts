'use server';
/**
 * @fileOverview Provides an AI-driven recommendation for position sizes for the next day based on market volatility.
 *
 * - suggestNextDayPositionSize - A function that handles the suggestion of next day's position size.
 * - SuggestNextDayPositionSizeInput - The input type for the suggestNextDayPositionSize function.
 * - SuggestNextDayPositionSizeOutput - The return type for the suggestNextDayPositionSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextDayPositionSizeInputSchema = z.object({
  previousTradingData: z
    .string()
    .describe(
      'Summary of the previous day trading data, including profit/loss, number of trades, win rate, and max drawdown.'
    ),
  currentMarketConditions: z
    .string()
    .describe(
      'Description of the current market conditions, including volatility, trending, ranging, and any significant news events.'
    ),
  technicalIndicators: z
    .string()
    .describe(
      'Summary of key technical indicators, such as RSI, MACD, Bollinger Bands, and ATR.'
    ),
});
export type SuggestNextDayPositionSizeInput = z.infer<typeof SuggestNextDayPositionSizeInputSchema>;

const SuggestNextDayPositionSizeOutputSchema = z.object({
  suggestedPositionSize: z
    .string()
    .describe(
      'The AI-driven recommendation for position sizes for the next day, expressed as a percentage increase or decrease from the current position size.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the recommendation, explaining how the previous trading data, current market conditions, and technical indicators were used to determine the suggested position size.'
    ),
});
export type SuggestNextDayPositionSizeOutput = z.infer<typeof SuggestNextDayPositionSizeOutputSchema>;

export async function suggestNextDayPositionSize(
  input: SuggestNextDayPositionSizeInput
): Promise<SuggestNextDayPositionSizeOutput> {
  return suggestNextDayPositionSizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextDayPositionSizePrompt',
  input: {schema: SuggestNextDayPositionSizeInputSchema},
  output: {schema: SuggestNextDayPositionSizeOutputSchema},
  prompt: `You are an expert trading assistant that analyzes trading data and market conditions to provide recommendations for position sizes for the next day.\n\nAnalyze the following information to determine the suggested position size for the next day:\n\nPrevious Trading Data: {{{previousTradingData}}}\n\nCurrent Market Conditions: {{{currentMarketConditions}}}\n\nTechnical Indicators: {{{technicalIndicators}}}\n\nBased on this analysis, provide a recommendation for the position size as a percentage increase or decrease, and explain your reasoning. Consider risk management when making your suggestion.\n\nOutput:\nSuggested Position Size: 
Reasoning: `,
});

const suggestNextDayPositionSizeFlow = ai.defineFlow(
  {
    name: 'suggestNextDayPositionSizeFlow',
    inputSchema: SuggestNextDayPositionSizeInputSchema,
    outputSchema: SuggestNextDayPositionSizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
