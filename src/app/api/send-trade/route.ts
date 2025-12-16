import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('📤 [API Route] /api/send-trade called');
  
  try {
    // 1. Parse the incoming request
    let signal;
    try {
      signal = await request.json();
      console.log('✅ [API Route] Parsed signal:', signal);
    } catch (parseError) {
      console.error('❌ [API Route] Failed to parse request JSON:', parseError);
      return NextResponse.json({
        status: 'error',
        message: 'Invalid JSON in request body'
      }, { status: 400 });
    }
    
    // 2. Validate required fields
    if (!signal.symbol || !signal.action || !signal.volume) {
      console.error('❌ [API Route] Missing required fields:', signal);
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields: symbol, action, volume'
      }, { status: 400 });
    }
    
    // 3. Send to bridge (USE YOUR NGROK URL)
    const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'https://poignant-tiddly-wilbert.ngrok-free.dev';
    console.log(`🔗 [API Route] Sending to bridge: ${BRIDGE_URL}/trade`);
    
    const bridgeResponse = await fetch(`${BRIDGE_URL}/trade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signal),
    });
    
    console.log(`📊 [API Route] Bridge response status: ${bridgeResponse.status}`);
    
    // 4. Get response text FIRST, then try to parse as JSON
    const responseText = await bridgeResponse.text();
    console.log(`📄 [API Route] Bridge raw response: ${responseText.substring(0, 200)}...`);
    
    let bridgeData;
    try {
      bridgeData = JSON.parse(responseText);
      console.log('✅ [API Route] Successfully parsed bridge JSON response');
    } catch (jsonError) {
      console.error('❌ [API Route] Bridge returned invalid JSON:', responseText);
      return NextResponse.json({
        status: 'error',
        message: 'Bridge returned invalid JSON',
        bridgeResponse: responseText.substring(0, 500)
      }, { status: 502 });
    }
    
    // 5. Return success
    return NextResponse.json({
      status: 'success',
      data: bridgeData,
      message: 'Trade executed successfully'
    });
    
  } catch (error: any) {
    console.error('❌ [API Route] Unexpected error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: `Failed to send trade: ${error.message || 'Unknown error'}`,
      error: error.toString()
    }, { status: 500 });
  }
}
