'use server';

// ===================== TYPES =====================
export interface MarketCondition {
  isTradingHours: boolean;
  volatilityIndex: 'LOW' | 'MEDIUM' | 'HIGH';
  spreadAcceptable: boolean;
  newsImpact: 'LOW' | 'MEDIUM' | 'HIGH';
  trendStrength: number; // 0-100
  marketStatus: 'READY' | 'AVOID' | 'HIGH_RISK';
  reasons: string[];
  lastCheck: string;
}

export interface TradingSession {
  name: string;
  open: number; // GMT hour
  close: number; // GMT hour
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredStrategy: string;
}

// ===================== CONSTANTS =====================
const TRADING_SESSIONS: TradingSession[] = [
  { name: 'ASIAN', open: 0, close: 8, volatility: 'LOW', preferredStrategy: 'Range' },
  { name: 'LONDON', open: 8, close: 17, volatility: 'MEDIUM', preferredStrategy: 'Breakout' },
  { name: 'NEW_YORK', open: 13, close: 22, volatility: 'HIGH', preferredStrategy: 'Trend' },
  { name: 'SYDNEY', open: 22, close: 24, volatility: 'LOW', preferredStrategy: 'Range' },
];

const MAJOR_NEWS_EVENTS = [
  'NFP', // Non-Farm Payrolls
  'FOMC', // Federal Reserve
  'CPI', // Consumer Price Index
  'INTEREST_RATE_DECISION'
];

// ===================== HELPER FUNCTIONS =====================
function getCurrentGMTHour(): number {
  return new Date().getUTCHours();
}

function getCurrentSession(): TradingSession {
  const hour = getCurrentGMTHour();
  
  for (const session of TRADING_SESSIONS) {
    if (session.open <= hour && hour < session.close) {
      return session;
    }
  }
  
  // Default to London session
  return TRADING_SESSIONS[1];
}

function calculateVolatility(session: TradingSession, hour: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  // London-New York overlap (1PM-5PM GMT) is highest volatility
  if (hour >= 13 && hour <= 17) {
    return 'HIGH';
  }
  
  // Pure London session
  if (hour >= 8 && hour <= 13) {
    return 'MEDIUM';
  }
  
  return session.volatility;
}

function checkNewsImpact(): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Placeholder - In production, integrate with economic calendar API
  const day = new Date().getUTCDay();
  
  // Assume high impact on Wednesdays (FOMC) and Fridays (NFP)
  if (day === 3) return 'MEDIUM'; // Wednesday
  if (day === 5) return 'HIGH'; // Friday
  
  return 'LOW';
}

function estimateSpread(): number {
  // Placeholder - In production, get real spread from MT5
  const hour = getCurrentGMTHour();
  
  // Spreads typically wider during low liquidity
  if (hour >= 22 || hour < 2) return 15; // Asian session
  if (hour >= 13 && hour <= 17) return 5; // London-NY overlap
  
  return 8; // Normal hours
}

// ===================== MAIN FUNCTION =====================
export async function checkMarketConditions(): Promise<MarketCondition> {
  const now = new Date();
  const hourGMT = getCurrentGMTHour();
  const currentSession = getCurrentSession();
  
  const reasons: string[] = [];
  
  // 1. Check trading hours
  const isTradingHours = hourGMT >= 8 && hourGMT <= 22; // Only trade 8AM-10PM GMT
  
  if (!isTradingHours) {
    reasons.push(`Outside trading hours (Current: ${hourGMT}:00 GMT)`);
  }
  
  // 2. Calculate volatility
  const volatilityIndex = calculateVolatility(currentSession, hourGMT);
  
  // 3. Check spread
  const currentSpread = estimateSpread();
  const spreadAcceptable = currentSpread <= 10; // Max 10 pips spread for Gold
  
  if (!spreadAcceptable) {
    reasons.push(`Spread too wide: ${currentSpread} pips`);
  }
  
  // 4. Check news impact
  const newsImpact = checkNewsImpact();
  
  if (newsImpact === 'HIGH') {
    reasons.push('High impact news expected');
  }
  
  // 5. Determine trend strength (placeholder - will be calculated from MT5 data)
  const trendStrength = 50; // Default neutral
  
  // 6. Determine market status
  let marketStatus: 'READY' | 'AVOID' | 'HIGH_RISK' = 'READY';
  
  if (!isTradingHours) {
    marketStatus = 'AVOID';
  } else if (newsImpact === 'HIGH' || volatilityIndex === 'HIGH') {
    marketStatus = 'HIGH_RISK';
  } else if (!spreadAcceptable) {
    marketStatus = 'AVOID';
  }
  
  return {
    isTradingHours,
    volatilityIndex,
    spreadAcceptable,
    newsImpact,
    trendStrength,
    marketStatus,
    reasons,
    lastCheck: now.toISOString()
  };
}

// ===================== UTILITY FUNCTIONS =====================
export function getRecommendedStrategy(session: TradingSession): string {
  return session.preferredStrategy;
}

export function getTradingWindow(): { open: string; close: string; current: string } {
  const hour = getCurrentGMTHour();
  const minutes = new Date().getUTCMinutes();
  
  const nextLondonOpen = hour < 8 ? '08:00' : 'Tomorrow 08:00';
  const nextLondonClose = hour < 17 ? '17:00' : 'Tomorrow 17:00';
  
  return {
    open: nextLondonOpen,
    close: nextLondonClose,
    current: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} GMT`
  };
}

export function shouldTradeToday(): boolean {
  const day = new Date().getUTCDay();
  // Avoid weekend trading (Friday after 10PM GMT to Sunday)
  if (day === 6) return false; // Saturday
  if (day === 0 && getCurrentGMTHour() < 8) return false; // Sunday early
  
  // Check for major holidays (simplified)
  const month = new Date().getUTCMonth();
  const date = new Date().getUTCDate();
  
  // Example: Christmas Day
  if (month === 11 && date === 25) return false;
  
  return true;
}

// ===================== TEST FUNCTION =====================
export async function testMarketConditions(): Promise<void> {
  const conditions = await checkMarketConditions();
  
  console.log('📊 MARKET CONDITIONS ANALYSIS');
  console.log('============================');
  console.log(`Market Status: ${conditions.marketStatus}`);
  console.log(`Trading Hours: ${conditions.isTradingHours ? '✅' : '❌'}`);
  console.log(`Volatility: ${conditions.volatilityIndex}`);
  console.log(`Spread Acceptable: ${conditions.spreadAcceptable ? '✅' : '❌'}`);
  console.log(`News Impact: ${conditions.newsImpact}`);
  console.log(`Trend Strength: ${conditions.trendStrength}/100`);
  
  if (conditions.reasons.length > 0) {
    console.log('\n⚠️  Reasons:');
    conditions.reasons.forEach(reason => console.log(`  - ${reason}`));
  }
  
  console.log(`\nCurrent Session: ${getCurrentSession().name}`);
  console.log(`Recommended Strategy: ${getRecommendedStrategy(getCurrentSession())}`);
  console.log(`Should Trade Today: ${shouldTradeToday() ? '✅' : '❌'}`);
}
