import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and notification settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Coming Soon</h3>
                    <p className="text-muted-foreground mt-2">
                        Account and platform settings will be available here soon.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
