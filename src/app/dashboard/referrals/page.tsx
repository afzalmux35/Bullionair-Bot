import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockReferralLeaderboard } from "@/lib/data";
import { Award, Gift, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReferralsPage() {
  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$71.80</div>
            <p className="text-xs text-muted-foreground">
              20% off your Pro plan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#3</div>
            <p className="text-xs text-muted-foreground">
              out of 1,842 users
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Referral Leaderboard</CardTitle>
          <CardDescription>See how you stack up against other traders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReferralLeaderboard.map((entry) => (
                <TableRow key={entry.rank} className={cn(entry.isCurrentUser && "bg-accent/50")}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.user} {entry.isCurrentUser && "(You)"}</TableCell>
                  <TableCell className="text-right">{entry.referrals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
