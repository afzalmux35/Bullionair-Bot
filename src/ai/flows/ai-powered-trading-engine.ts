'use server';
/**
 * @fileOverview An AI-powered trading engine for automated gold trading.
 *
 * - aiPoweredTradingEngine - A function that initiates the AI-powered trading process.
 * - AiPoweredTradingEngineInput - The input type for the aiPoweredTradingEngine function.
 * - AiPoweredTradingEngineOutput - The return type for the aiPoweredTradingEngine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredTradingEngineInputSchema = z.object({
  riskLimit: z.number().describe('The maximum risk limit for the trading day.'),
  profitTarget: z.number().describe('The desired profit target for the trading day.'),
});
export type AiPoweredTradingEngineInput = z.infer<typeof AiPoweredTradingEngineInputSchema>;

const AiPoweredTradingEngineOutputSchema = z.object({
  confirmationMessage: z.string().describe('A confirmation message indicating the trading engine is active.'),
});
export type AiPoweredTradingEngineOutput = z.infer<typeof AiPoweredTradingEngineOutputSchema>;

export async function aiPoweredTradingEngine(input: AiPoweredTradingEngineInput): Promise<AiPoweredTradingEngineOutput> {
  return aiPoweredTradingEngineFlow(input);
}

const tradingEnginePrompt = ai.definePrompt({
  name: 'tradingEnginePrompt',
  input: {schema: AiPoweredTradingEngineInputSchema},
  output: {schema: AiPoweredTradingEngineOutputSchema},
  prompt: `You are an AI-powered trading engine specializing in automated gold trading. The user has set a risk limit of {{{riskLimit}}} and a profit target of {{{profitTarget}}}. Confirm that the trading engine is now active and monitoring the markets 24/7 to achieve the profit target while adhering to the risk limit. Provide a confirmation message.`,
});

const aiPoweredTradingEngineFlow = ai.defineFlow(
  {
    name: 'aiPoweredTradingEngineFlow',
    inputSchema: AiPoweredTradingEngineInputSchema,
    outputSchema: AiPoweredTradingEngineOutputSchema,
  },
  async input => {
    const {output} = await tradingEnginePrompt(input);
    return output!;
  }
);
