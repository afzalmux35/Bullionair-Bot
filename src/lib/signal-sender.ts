'use server';

/**
 * Send trade signal to MT5 bridge
 */
export async function sendTradeSignalToBridge(signal: {
  symbol: string;
  action: 'BUY' | 'SELL';
  volume: number;
  comment?: string;
}) {
  try {
    console.log('📤 [Signal Sender] Sending to bridge:', signal);
    
    // IMPORTANT: Use your local bridge URL
    const BRIDGE_URL = 'http://localhost:8000';
    
    const response = await fetch(`${BRIDGE_URL}/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signal),
    });
    
    if (!response.ok) {
      throw new Error(`Bridge responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ [Signal Sender] Bridge response:', result);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ [Signal Sender] Error:', error.message);
    return {
      status: 'error',
      message: `Failed to send to bridge: ${error.message}`,
      error: error.toString()
    };
  }
}

/**
 * Test bridge connection
 */
export async function testBridgeConnection() {
  try {
    const response = await fetch('http://localhost:8000/health');
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 [Bridge Test] Connection status:', data);
    
    return {
      status: 'success',
      data,
      message: 'Bridge connection successful'
    };
    
  } catch (error: any) {
    console.error('❌ [Bridge Test] Error:', error.message);
    return {
      status: 'error',
      message: `Bridge connection failed: ${error.message}`,
      error: error.toString()
    };
  }
}

/**
 * Generate random trade signal for testing
 * REMOVED: Not needed in server action
 */
// export function generateRandomSignal() {
//   const actions = ['BUY', 'SELL'] as const;
//   const action = actions[Math.floor(Math.random() * actions.length)];
//   
//   return {
//     symbol: 'XAUUSDm',
//     action: action,
//     volume: 0.01,
//     comment: `Bullionair-Bot ${action} signal`
//   };
// }
