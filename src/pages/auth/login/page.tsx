import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { db } from "../../../lib/db";
import { useAuthStore } from "../../../store/auth";
import { GoogleButton } from "./google-button";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (db.tables.length === 0) {
        navigate("/auth/sync");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, navigate]);

  const onSkipLogin = () => {
    db.open();
    login({
      id: "local-user",
      name: "Local User",
      picture: null,
      access_token: null,
    });
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen max-w-lg w-full flex flex-col items-center justify-center p-8 rounded-lg shadow-md mx-auto">
      <div className="w-full space-y-4 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6">
          <img src="/wallette.webp" alt="Wallette Logo" className="h-12 w-12" />
          <h1 className="text-2xl font-bold">Wallette.</h1>
        </div>
        <div className="w-full text-sm">
          In order to sync your financial data across your devices, Wallette
          requires you to sign in to your Google account.
        </div>
        <div className="w-full text-sm">
          You can skip this step and use Wallette only on this device.
        </div>
        <GoogleButton />
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={onSkipLogin}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
