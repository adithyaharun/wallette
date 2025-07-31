import { Loader2Icon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

export function SyncPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Loader2Icon className="h-16 w-16 animate-spin" />
          <div className="text-center space-y-2">
            <h1 className="text-lg md:text-2xl font-medium">
              Preparing Your Data
            </h1>
            <p className="text-sm text-muted-foreground">
              We are currently syncing your financial data from your Google
              Drive. Please wait a moment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
