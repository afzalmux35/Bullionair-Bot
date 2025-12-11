export type Trade = {
  id: number;
  type: 'BUY' | 'SELL';
  lots: number;
  price: number;
  timestamp: string;
  status: 'WON' | 'LOST' | 'OPEN';
  profit?: number;
  pnl?: number; // pnl for open trades
  risk: number;
  takeProfit: number;
  stopLoss: number;
  confidence: 'High' | 'Moderate' | 'Low';
};

export type DailySummary = {
  startingBalance: number;
  endingBalance: number;
  tradesTaken: number;
  winningTrades: number;
  totalProfit: number;
  maxDrawdown: number;
  winRate: number;
};

export type BotActivity = {
  timestamp: string;
  message: string;
  type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE' | 'SUMMARY';
};

export type DailyGoal = {
  type: 'profit' | 'risk';
  value: number;
}
