// import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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

createRoot(root).render(
  <StrictMode>
    <UIProvider>
      <QueryClientProvider client={queryClient}>
        {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
        <Wallette />
        {/* </GoogleOAuthProvider> */}
      </QueryClientProvider>
      <Updater />
    </UIProvider>
    <Toaster />
  </StrictMode>,
);
