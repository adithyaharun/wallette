import { Link } from "react-router";
import { Button } from "../../components/ui/button";

export default function WelcomePage() {
  return (
    <div className="w-full max-w-lg mx-auto h-screen flex flex-col justify-center items-center md:items-start px-4 space-y-6">
      <img src="/pwa-192x192.png" alt="Wallette Logo" width={64} />
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-2xl font-bold">Welcome to Wallette!</h1>
        <p className="text-sm text-muted-foreground">
          Your personal finance companion. Track your expenses, manage budgets,
          and take control of your financial future everywhere you go.
        </p>
        <p className="text-sm text-muted-foreground">
          No matter where you are, you can access Wallette in most situations
          even when you have no internet. Start your financial journey today!
        </p>
      </div>

      <div className="w-full space-y-3 mt-8">
        <p className="text-sm font-medium text-center">
          Have you used Wallette before?
        </p>

        <div className="flex flex-col gap-2">
          <Button className="w-full" asChild>
            <Link to="/import">Yes, Restore My Data</Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/setup">No, I'm New Here</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          If you have a backup file (.wlworkspace) from another device, choose
          "Restore My Data"
        </p>
      </div>
    </div>
  );
}
