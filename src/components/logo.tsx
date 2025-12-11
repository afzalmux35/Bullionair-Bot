import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

export function Logo({ className, size = 'default' }: { className?: string, size?: 'default' | 'sm' }) {
  const sizeClasses = {
    default: {
      icon: "h-7 w-7",
      text: "text-2xl",
    },
    sm: {
      icon: "h-6 w-6",
      text: "text-xl",
    }
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Crown className={cn(sizeClasses[size].icon, "text-primary")} />
      <span className={cn("font-headline font-bold text-foreground", sizeClasses[size].text)}>
        Bullionaire Bot
      </span>
    </div>
  );
}
