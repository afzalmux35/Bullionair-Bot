// Create test file: src/app/test-market/page.tsx
'use client';
import { testMarketConditions } from '@/lib/trading-strategy/market-conditions';

export default function TestMarketPage() {
  const runTest = async () => {
    await testMarketConditions();
  };
  
  return <button onClick={runTest}>Test Market Conditions</button>;
}
