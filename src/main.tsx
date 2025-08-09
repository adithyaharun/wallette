/** biome-ignore-all assist/source/organizeImports: react-scan needs to be imported first before react and react-dom */
import { scan } from "react-scan"; // must be imported before React and React DOM
// import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BudgetRenewal } from "./components/fragments/budget-renewal.tsx";
import { Updater } from "./components/fragments/updater.tsx";
import { UIProvider } from "./components/providers/ui-provider/index.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import Wallette from "./Wallette.tsx";
import "./index.css";
import "./lib/dayjs";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

const queryClient = new QueryClient();

if (import.meta.env.DEV) {
  scan({
    enabled: true,
  });
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
        <Wallette />
        <BudgetRenewal />
        <Updater />
        <Toaster />
        {/* </GoogleOAuthProvider> */}
      </UIProvider>
    </QueryClientProvider>
  </StrictMode>,
);
