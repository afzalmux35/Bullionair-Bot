export interface DailyGoal {
  type: 'profit' | 'risk';
  value: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionId?: string;
  referralCode?: string;
  referredById?: string;
  accuracyBoostUntil?: string;
  virtualBalance?: number;
}

export interface TradingAccount {
  id: string;
  userProfileId: string;
  startingBalance: number;
  currentBalance: number;
  dailyRiskLimit: number;
  dailyProfitTarget: number;
  maxPositionSize: number;
  autoTradingActive: boolean;
}

export interface Trade {
  id: string;
  tradingAccountId: string;
  timestamp: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  volume: number;
  profit?: number;
  confidenceLevel?: string;
  status: 'OPEN' | 'CLOSED';
  stopLoss?: number;
  takeProfit?: number;
}

export interface BotActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'ANALYSIS' | 'SIGNAL' | 'RESULT' | 'UPDATE';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  tradeLimit: number;
  accuracyTarget: number;
  features: string[];
}

export interface DailyRecommendation {
  id: string;
  tradingAccountId: string;
  date: string;
  recommendedPositionSize: number;
  reasoning: string;
}
