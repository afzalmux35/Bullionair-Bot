'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { DailyGoal, Trade } from '@/lib/types';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { closeTrade, placeTrade } from '@/lib/brokerage-service';

import {
  TrendingUp,
  CircleDot,
  PauseCircle,
  Settings2,
  List,
  DollarSign,
  BarChart2,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { BotActivity } from '@/lib/types';

type LiveDashboardViewProps = {
  dailyGoal: DailyGoal;
  confirmationMessage: string;
  onPause: () => void;
  tradingAccountId: string;
};

const tradeActions = [
  "Analyzing market volatility...",
  "Scanning for high-probability setups...",
  "Trend confirmed. Looking for entry point.",
  "Market is ranging. Waiting for a breakout.",
  "Strong BUY signal detected. Confidence: 85%.",
  "Strong SELL signal detected. Confidence: 88%.",
  "Closing trade for a profit.",
  "Stop loss hit. Closing trade.",
  "Take profit target reached.",
];

const confidenceLevels = ["High", "Strong", "Moderate"];
const volumes = [0.1, 0.2, 0.5, 1.0];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function LiveDashboardView({ dailyGoal, onPause, tradingAccountId }: LiveDashboardViewProps) {
  const [nextAnalysisTime, setNextAnalysisTime] = useState(47);
  const { user } = useUser();
  const firestore = useFirestore();

  const tradesQuery = useMemoFirebase(() => {
    if (!user || !tradingAccountId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'tradingAccounts', tradingAccountId, 'trades'),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, user, tradingAccountId]);

  const { data: trades, isLoading: tradesLoading } = useCollection<Trade>(tradesQuery);
  const openTrade = trades?.find(trade => trade.status === 'OPEN');

  const botActivitiesCollection = useMemoFirebase(() => {
    if(!user || !tradingAccountId) return null;
    return collection(firestore, 'users', user.uid, 'tradingAccounts', tradingAccountId, 'botActivities');
  }, [firestore, user, tradingAccountId]);

  const botActivitiesQuery = useMemoFirebase(() => {
    if (!botActivitiesCollection) return null;
    return query(
      botActivitiesCollection,
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [botActivitiesCollection]);

  const { data: botActivities } = useCollection<BotActivity>(botActivitiesQuery);

  // Trade simulation logic
  useEffect(() => {
    if (!firestore || !user || !tradingAccountId || !botActivitiesCollection) return;

    const simulateBotAction = async () => {
      const action = getRandomItem(tradeActions);

      const activity = {
        id: '', // Firestore will generate
        message: action,
        timestamp: new Date().toISOString(),
        type: action.includes('signal') ? 'SIGNAL' : (action.includes('Closing') ? 'RESULT' : 'ANALYSIS'),
      };
      addDocumentNonBlocking(botActivitiesCollection, activity);

      // If there's an open trade, maybe close it
      if (openTrade && Math.random() > 0.6) {
        const profit = (Math.random() - 0.4) * 150; // Random profit/loss
        const exitPrice = openTrade.entryPrice + (profit / openTrade.volume / 100);
        closeTrade(firestore, user.uid, tradingAccountId, openTrade.id, exitPrice, profit);

        const resultActivity = {
            id: '',
            message: `Trade closed. P/L: $${profit.toFixed(2)}`,
            timestamp: new Date().toISOString(),
            type: 'RESULT',
        };
        addDocumentNonBlocking(botActivitiesCollection, resultActivity);

      } 
      // If there's NO open trade, maybe open one
      else if (!openTrade && (action.includes("BUY") || action.includes("SELL"))) {
        const tradeType = action.includes("BUY") ? "BUY" : "SELL";
        await placeTrade(firestore, user.uid, tradingAccountId, {
          symbol: 'XAUUSD',
          type: tradeType,
          volume: getRandomItem(volumes),
          entryPrice: 1950 + Math.random() * 10,
          confidenceLevel: getRandomItem(confidenceLevels),
        });
      }
    };

    const simulationInterval = setInterval(simulateBotAction, 15000); // New action every 15s
    
    return () => clearInterval(simulationInterval);

  }, [firestore, user, tradingAccountId, openTrade, botActivitiesCollection]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextAnalysisTime(prev => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const closedTrades = trades?.filter(trade => trade.status !== 'OPEN') || [];
  const profit = closedTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
  const wins = closedTrades.filter(trade => (trade.profit || 0) > 0).length;
  const losses = closedTrades.length - wins;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

  // Assuming starting balance comes from somewhere, for now, we'll estimate it.
  const balance = 10000 + profit;
  const profitPercentage = dailyGoal.type === 'profit' ? (profit / dailyGoal.value) * 100 : 0;

  const statCards = [
    {
      title: 'Current Balance',
      value: `$${balance.toLocaleString('en-US')}`,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Today's P/L",
      value: `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Trades Today',
      value: `${closedTrades.length} (${wins}W, ${losses}L)`,
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                {dailyGoal.type === 'profit' ? "Today's Goal" : "Risk Limit"}
              </CardDescription>
              <CardTitle className="text-4xl font-bold">
                ${dailyGoal.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {dailyGoal.type === 'profit' ? `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${profitPercentage.toFixed(0)}% achieved)` : `-$500 max risk`}
              </div>
            </CardContent>
            {dailyGoal.type === 'profit' && (
              <CardContent className="pt-0">
                <Progress value={profitPercentage} aria-label={`${profitPercentage.toFixed(0)}% towards goal`} />
              </CardContent>
            )}
          </Card>
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", card.title === "Today's P/L" && (profit > 0 ? "text-green-400" : profit < 0 ? "text-red-400" : ""))}>{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bot Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {botActivities?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{activity.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Auto-Trading Status</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                <CircleDot className="mr-2 h-3 w-3 animate-pulse text-green-400" /> ACTIVE
              </Badge>
            </CardTitle>
            <CardDescription>Since 8:00 AM</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="h-4 w-4"/>
                    <span>Next analysis in:</span>
                </div>
                <span className="font-mono font-semibold">00:{String(nextAnalysisTime).padStart(2, '0')}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={onPause}><PauseCircle className="mr-2"/> Pause Trading</Button>
                <Button variant="ghost" size="icon"><Settings2 /></Button>
                <Button variant="ghost" size="icon"><List /></Button>
            </div>
          </CardContent>
        </Card>
        {openTrade && (
          <Card>
            <CardHeader>
              <CardTitle>Open Trade</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn("hover:bg-blue-500/30", openTrade.type === 'BUY' ? "bg-blue-500/20 text-blue-300 border-blue-500/50" : "bg-red-500/20 text-red-300 border-red-500/50")}>⚡ {openTrade.type}</Badge>
                  <span className="font-semibold">{openTrade.volume} lots @ ${openTrade.entryPrice}</span>
                </div>
                <span className={cn(
                  "font-bold",
                  (openTrade.profit || 0) > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {/* Realtime P/L would go here */}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                      <p className="text-muted-foreground">Risk</p>
                      <p className="font-mono text-red-400">$-{((openTrade.entryPrice - (openTrade.entryPrice * 0.995)) * openTrade.volume * 100).toFixed(2)}</p>
                  </div>
                   <div>
                      <p className="text-muted-foreground">Stop Loss</p>
                      <p className="font-mono">${(openTrade.entryPrice * 0.995).toFixed(2)}</p>
                  </div>
                  <div>
                      <p className="text-muted-foreground">Take Profit</p>
                      <p className="font-mono text-green-400">${(openTrade.entryPrice * 1.01).toFixed(2)}</p>
                  </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Running: {Math.floor((new Date().getTime() - new Date(openTrade.timestamp).getTime()) / 60000)} min | Confidence: {openTrade.confidenceLevel}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
