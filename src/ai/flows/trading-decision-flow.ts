'use server';

// SIMPLE DECISION FLOW - NO GOOGLE AI
export const tradingDecisionFlow = {
  // Mock function that returns a simple decision
  async execute(input: any) {
    console.log('🤖 [Decision Flow] Simple logic running');
    
    // 50% chance to trade
    const shouldTrade = Math.random() > 0.5;
    
    if (!shouldTrade) {
      return {
        decision: 'WAIT',
        reasoning: 'Market volatility too low',
        tradeDetails: null
      };
    }
    
    return {
      decision: Math.random() > 0.5 ? 'OPEN_BUY' : 'OPEN_SELL',
      reasoning: 'Time-based trading signal',
      tradeDetails: {
        volume: 0.01,
        confidenceLevel: 'Medium',
        stopLoss: 5, // 5 pips
        takeProfit: 10 // 10 pips
      }
    };
  }
};
