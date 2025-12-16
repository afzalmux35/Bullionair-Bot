import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'https://poignant-tiddly-wilbert.ngrok-free.dev';
    const response = await fetch(`${BRIDGE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Bridge health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      data,
      message: 'Bridge connection successful'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `Bridge connection failed: ${error.message}`,
      error: error.toString()
    }, { status: 500 });
  }
}
