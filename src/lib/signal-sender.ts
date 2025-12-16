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
    
    // Use ngrok URL
    const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'https://poignant-tiddly-wilbert.ngrok-free.dev';
    
    const response = await fetch(`${BRIDGE_URL}/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signal),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bridge responded with ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ [Signal Sender] Bridge response:', result);
    
    return {
      status: 'success',
      data: result,
      message: 'Trade sent successfully'
    };
    
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
    const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'https://poignant-tiddly-wilbert.ngrok-free.dev';
    const response = await fetch(`${BRIDGE_URL}/health`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Health check failed: ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🔍 [Bridge Test] Connection status:', data);
    
    return {
      status: 'success',
      data: data,
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
