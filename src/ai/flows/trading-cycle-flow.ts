'use server';

import { sendTradeSignalToBridge } from '@/lib/signal-sender';

export async function runTradingCycleFlow(input: any) {
  console.log('🔄 [Trading Cycle] Started for account:', input?.tradingAccountId);
  
  try {
    // For now: Generate random trade signals (30% chance)
    const shouldTrade = Math.random() > 0.7;
    
    if (shouldTrade) {
      console.log('🎯 [Trading Cycle] Generating trade signal...');
      
      const signal = {
        symbol: 'XAUUSDm',
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        volume: 0.01,
        comment: 'Bullionair-Bot AI Signal'
      };
      
      console.log('📊 [Trading Cycle] Signal:', signal);
      
      // Send to bridge
      const bridgeResult = await sendTradeSignalToBridge(signal);
      
      console.log('⚡ [Trading Cycle] Bridge result:', bridgeResult);
      
      return {
        status: 'trade_executed',
        signal,
        bridgeResult,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.log('⏳ [Trading Cycle] No trade - waiting for better opportunity');
      return {
        status: 'no_trade',
        message: 'AI analyzing market conditions...',
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error: any) {
    console.error('❌ [Trading Cycle] Error:', error.message);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// For backward compatibility
export async function runTradingCycle(input: any) {
  return runTradingCycleFlow(input);
}
