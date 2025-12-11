import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="mb-4 justify-center" />
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="trader@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full !mt-6" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center gap-2">
           <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/#pricing" className="font-medium text-primary hover:underline">
                Start your free trial
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
