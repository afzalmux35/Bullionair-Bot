"use client";

import { useState } from "react";
import { DailyConfigForm } from "@/components/daily-config-form";
import { LiveDashboardView } from "@/components/live-dashboard-view";
import { PerformanceReview } from "@/components/performance-review";
import type { DailyGoal } from "@/lib/types";
import { Separator } from "./ui/separator";

export function DashboardPage() {
  const [isTradingActive, setIsTradingActive] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ type: "profit", value: 1000 });
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleStartTrading = (goal: DailyGoal, confirmation: string) => {
    setDailyGoal(goal);
    setConfirmationMessage(confirmation);
    setIsTradingActive(true);
  };
  
  const handlePauseTrading = () => {
    setIsTradingActive(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {!isTradingActive ? (
        <DailyConfigForm onStartTrading={handleStartTrading} />
      ) : (
        <LiveDashboardView dailyGoal={dailyGoal} confirmationMessage={confirmationMessage} onPause={handlePauseTrading} />
      )}
      <Separator />
      <PerformanceReview />
    </div>
  );
}
