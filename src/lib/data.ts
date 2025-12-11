import type { Trade, DailySummary, BotActivity } from './types';

export const mockOpenTrade: Trade = {
  id: 4,
  type: 'BUY',
  lots: 0.25,
  price: 2118,
  timestamp: '14:30',
  status: 'OPEN',
  pnl: 120,
  risk: -100,
  takeProfit: 2138,
  stopLoss: 2108,
  confidence: 'High'
};

export const mockBotActivities: BotActivity[] = [
  { timestamp: '08:00', message: 'AUTO-TRADING: ACTIVE. Goal: $1,000 Profit. Max Risk: $500.', type: 'UPDATE' },
  { timestamp: '08:15', message: 'Market analysis: London session starting, high volatility expected.', type: 'ANALYSIS' },
  { timestamp: '09:30', message: 'SIGNAL: BUY 0.2 lots @ $2,115 (Strong confidence)', type: 'SIGNAL' },
  { timestamp: '09:45', message: 'TRADE WON: +$180 profit | Today: +$180/1,000', type: 'RESULT' },
  { timestamp: '11:20', message: 'SIGNAL: SELL 0.15 lots @ $2,125 (Moderate confidence)', type: 'SIGNAL' },
  { timestamp: '11:55', message: 'TRADE LOST: -$90 loss | Today: +$90/1,000', type: 'RESULT' },
  { timestamp: '12:00', message: 'MARKET UPDATE: Low volume during lunch, reducing position sizes.', type: 'UPDATE' },
  { timestamp: '13:00', message: 'Market analysis: New York session opening, preparing for increased aggression.', type: 'ANALYSIS' },
  { timestamp: '14:30', message: 'SIGNAL: BUY 0.25 lots @ $2,118 (High confidence)', type: 'SIGNAL' },
  { timestamp: '23:59', message: 'DAILY SUMMARY: 8 trades, 6 wins, +$1,240 profit.', type: 'SUMMARY' },
];

export const mockPerformanceSummary: DailySummary = {
  startingBalance: 10000,
  endingBalance: 11240,
  tradesTaken: 8,
  winningTrades: 6,
  winRate: 75,
  totalProfit: 1240,
  maxDrawdown: -280,
};

export const mockReferralLeaderboard = [
  { rank: 1, user: 'CryptoKing', referrals: 25 },
  { rank: 2, user: 'ForexQueen', referrals: 18 },
  { rank: 3, user: 'Yourself', referrals: 12, isCurrentUser: true },
  { rank: 4, user: 'ScalperSam', referrals: 11 },
  { rank: 5, user: 'SwingTraderSue', referrals: 9 },
];
