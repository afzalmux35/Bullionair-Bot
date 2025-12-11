"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockPerformanceSummary } from "@/lib/data";
import { BarChart, Wand2, Lightbulb } from "lucide-react";
import { suggestNextDayPositionSize } from "@/ai/flows/suggest-next-day-position-size";
import type { SuggestNextDayPositionSizeOutput } from "@/ai/flows/suggest-next-day-position-size";
import { useToast } from "@/hooks/use-toast";

const suggestionFormSchema = z.object({
  previousTradingData: z.string().min(10, { message: "Please provide more detail about previous trading." }),
  currentMarketConditions: z.string().min(10, { message: "Please provide more detail about market conditions." }),
  technicalIndicators: z.string().min(10, { message: "Please provide more detail about technical indicators." }),
});

export function PerformanceReview() {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<SuggestNextDayPositionSizeOutput | null>(null);

  const form = useForm<z.infer<typeof suggestionFormSchema>>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      previousTradingData: `Total Profit: $${mockPerformanceSummary.totalProfit}, Win Rate: ${mockPerformanceSummary.winRate}%, Trades: ${mockPerformanceSummary.tradesTaken}, Max Drawdown: $${mockPerformanceSummary.maxDrawdown}`,
      currentMarketConditions: "Moderate volatility, potential for range-bound movement in Asian session, awaiting London open for trend confirmation.",
      technicalIndicators: "RSI is neutral (55), MACD showing potential bullish crossover, Bollinger Bands are contracting suggesting a breakout is possible.",
    },
  });

  async function onSubmit(values: z.infer<typeof suggestionFormSchema>) {
    try {
      const result = await suggestNextDayPositionSize(values);
      setSuggestion(result);
      toast({
        title: "💡 Suggestion Generated",
        description: "Your AI-powered suggestion for tomorrow is ready.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Generation Failed",
        description: "Could not generate a suggestion. Please try again.",
      });
    }
  }

  const summaryData = [
    { label: "Starting Balance", value: `$${mockPerformanceSummary.startingBalance.toLocaleString()}` },
    { label: "Ending Balance", value: `$${mockPerformanceSummary.endingBalance.toLocaleString()}`, change: `+${(mockPerformanceSummary.endingBalance / mockPerformanceSummary.startingBalance * 100 - 100).toFixed(2)}%` },
    { label: "Total Profit", value: `$${mockPerformanceSummary.totalProfit.toLocaleString()}`, isPositive: true },
    { label: "Win Rate", value: `${mockPerformanceSummary.winRate}%` },
    { label: "Trades Taken", value: mockPerformanceSummary.tradesTaken },
    { label: "Max Drawdown", value: `-$${Math.abs(mockPerformanceSummary.maxDrawdown).toLocaleString()}`, isNegative: true },
  ];

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><BarChart /> Today's Performance Report</CardTitle>
          <CardDescription>A summary of the bot's trading activity for the day.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {summaryData.map((item) => (
                <TableRow key={item.label}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.isPositive ? "text-green-400" : item.isNegative ? "text-red-400" : ""}>{item.value}</span>
                    {item.change && <span className="ml-2 text-xs text-muted-foreground">{item.change}</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Tomorrow's AI Suggestion</CardTitle>
              <CardDescription>Get an AI-driven recommendation for tomorrow's position sizing based on today's market.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestion ? (
                <Alert className="border-accent">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent">AI Recommendation</AlertTitle>
                  <AlertDescription>
                    <p className="font-bold text-lg mb-2">{suggestion.suggestedPositionSize}</p>
                    <p className="text-sm">{suggestion.reasoning}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <FormField control={form.control} name="previousTradingData" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Trading Data</FormLabel>
                      <FormControl><Textarea rows={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currentMarketConditions" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Market Conditions</FormLabel>
                      <FormControl><Textarea rows={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="technicalIndicators" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Indicators</FormLabel>
                      <FormControl><Textarea rows={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {suggestion && <Button variant="outline" onClick={() => setSuggestion(null)}>Refine & Regenerate</Button>}
              <Button type="submit" disabled={form.formState.isSubmitting || !!suggestion}>
                {form.formState.isSubmitting ? "Generating..." : "Generate Suggestion"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
