import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Detailed analysis of your trading history.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Coming Soon</h3>
                    <p className="text-muted-foreground mt-2">
                        Advanced reporting and analytics are under development.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
