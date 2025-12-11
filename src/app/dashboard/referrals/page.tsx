'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { collection, doc, query, where } from "firebase/firestore";
import { Award, Gift, Users } from "lucide-react";

export default function ReferralsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const referralsQuery = useMemoFirebase(() => {
    if (!user || !userProfile) return null;
    return query(collection(firestore, 'users'), where('referredById', '==', userProfile.id));
  }, [firestore, user, userProfile]);

  // Note: The 'list' permission was removed due to security constraints. 
  // We can't query all users anymore.
  // const { data: referrals, isLoading: isLoadingReferrals } = useCollection<UserProfile>(referralsQuery);
  const referrals = []; // Placeholder
  const isLoadingReferrals = false; // Placeholder

  const leaderboard = [
      { id: '1', user: 'Mark L.', referrals: 15, rank: 1, isCurrentUser: false },
      { id: '2', user: 'Sarah K.', referrals: 12, rank: 2, isCurrentUser: false },
      { id: user?.uid || '3', user: `${userProfile?.firstName} ${userProfile?.lastName} (You)`, referrals: 5, rank: 3, isCurrentUser: true },
      { id: '4', user: 'David C.', referrals: 4, rank: 4, isCurrentUser: false },
  ];

    const currentUserRank = leaderboard.find(u => u.isCurrentUser)?.rank;

  const totalReferrals = 5; // referrals?.length || 0;
  const monthlySavings = totalReferrals * 29.9; // Assuming $299/mo pro plan, 10% discount

  if (isLoadingProfile || isLoadingReferrals) {
      return <div>Loading...</div>
  }

  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Illustrative data for prototype
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlySavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalReferrals * 10}% off your Pro plan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUserRank ? `#${currentUserRank}`: 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              out of {leaderboard.length} users
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Referral Leaderboard</CardTitle>
          <CardDescription>See how you stack up against other traders. Your referral code: <span className="font-mono text-primary">{userProfile?.referralCode}</span></CardDescription>
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
              {leaderboard.slice(0, 10).map((entry) => (
                <TableRow key={entry.id} className={cn(entry.isCurrentUser && "bg-accent/50")}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.user}</TableCell>
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
