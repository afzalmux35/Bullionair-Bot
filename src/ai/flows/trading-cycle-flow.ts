'use server';

import { sendTradeSignalToBridge } from '@/lib/signal-sender';

// Simple trading logic - NO GOOGLE AI
export async function runTradingCycleFlow(input: any) {
  console.log(`🤖 [Bullionaire Bot] Trading cycle running...`);
  
  try {
    // Simple strategy: Trade based on time and random analysis
    const hour = new Date().getHours();
    
    // Higher probability during active market hours (1 PM - 10 PM PKT)
    const isActiveHours = hour >= 13 && hour <= 22;
    const tradeProbability = isActiveHours ? 0.7 : 0.3;
    
    if (Math.random() > tradeProbability) {
      console.log('⏳ No trade - waiting for better opportunity');
      return {
        status: 'waiting',
        message: 'Market conditions not optimal',
        timestamp: new Date().toISOString()
      };
    }
    
    // Generate signal
    const signal = {
      symbol: 'XAUUSDm',
      action: Math.random() > 0.5 ? 'BUY' : 'SELL' as const,
      volume: 0.01,
      comment: `Bullionaire Bot | Time-based signal`
    };
    
    console.log(`🎯 Generated signal: ${signal.action} ${signal.symbol}`);
    
    // Send to bridge
    const bridgeResult = await sendTradeSignalToBridge(signal);
    
    return {
      status: 'trade_executed',
      signal,
      bridgeResult,
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('❌ Trading cycle error:', error.message);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export async function runTradingCycle(input: any) {
  return runTradingCycleFlow(input);
}
