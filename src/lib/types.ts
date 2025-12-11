export type Trade = {
  id: string;
  tradingAccountId: string;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  volume: number;
  profit: number;
  confidenceLevel: string;
  status: 'WON' | 'LOST' | 'OPEN';
};

export type DailySummary = {
  startingBalance: number;
  endingBalance: number;
  currentBalance: number;
  tradesTaken: number;
  winningTrades: number;
  totalProfit: number;
  maxDrawdown: number;
  winRate: number;
};

export type BotActivity = {
  id: string;
  timestamp: string;
  message: string;
  type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE' | 'SUMMARY';
};

export type DailyGoal = {
  type: 'profit' | 'risk';
  value: number;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  referredById?: string;
};

export type TradingAccount = {
  id: string;
  userProfileId: string;
  startingBalance: number;
  currentBalance: number;
  dailyRiskLimit: number;
  dailyProfitTarget: number;
  maxPositionSize: number;
  autoTradingActive: boolean;
};
