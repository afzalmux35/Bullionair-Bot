"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockBotActivities, mockOpenTrade } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { DailyGoal } from "@/lib/types";

import {
  TrendingUp,
  TrendingDown,
  CircleDot,
  PauseCircle,
  Settings2,
  List,
  DollarSign,
  BarChart2,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

type LiveDashboardViewProps = {
  dailyGoal: DailyGoal;
  confirmationMessage: string;
  onPause: () => void;
};

export function LiveDashboardView({ dailyGoal, onPause }: LiveDashboardViewProps) {
  const [currentTime, setCurrentTime] = useState('00:47');

  useEffect(() => {
    let seconds = 47;
    const timer = setInterval(() => {
      seconds--;
      if (seconds < 0) seconds = 59;
      setCurrentTime(`00:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const profit = 420;
  const balance = 10420;
  const profitPercentage = dailyGoal.type === 'profit' ? (profit / dailyGoal.value) * 100 : 0;

  const statCards = [
    {
      title: "Current Balance",
      value: `$${balance.toLocaleString('en-US')}`,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Today's P/L",
      value: `+$${profit.toLocaleString('en-US')}`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Win Rate",
      value: "66.7%",
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Trades Today",
      value: "3 (2W, 1L)",
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
                {dailyGoal.type === 'profit' ? `+${profit} (${profitPercentage.toFixed(0)}% achieved)` : `-$500 max risk`}
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
                <div className="text-2xl font-bold">{card.value}</div>
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
                  {mockBotActivities.slice(0, 9).map((activity) => (
                    <TableRow key={activity.timestamp}>
                      <TableCell className="font-mono text-sm text-muted-foreground">{activity.timestamp}</TableCell>
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
                <span className="font-mono font-semibold">{currentTime}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={onPause}><PauseCircle className="mr-2"/> Pause Trading</Button>
                <Button variant="ghost" size="icon"><Settings2 /></Button>
                <Button variant="ghost" size="icon"><List /></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Trade</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30">⚡ {mockOpenTrade.type}</Badge>
                <span className="font-semibold">{mockOpenTrade.lots} lots @ ${mockOpenTrade.price}</span>
              </div>
              <span className={cn(
                "font-bold",
                mockOpenTrade.pnl > 0 ? "text-green-400" : "text-red-400"
              )}>
                {mockOpenTrade.pnl > 0 ? '+' : ''}${mockOpenTrade.pnl}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                    <p className="text-muted-foreground">Risk</p>
                    <p className="font-mono text-red-400">${mockOpenTrade.risk}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Stop Loss</p>
                    <p className="font-mono">${mockOpenTrade.stopLoss}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Take Profit</p>
                    <p className="font-mono text-green-400">${mockOpenTrade.takeProfit}</p>
                </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">Running: 15 min | Confidence: {mockOpenTrade.confidence}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
