import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "./components/ui/sonner.tsx";
import Wallette from "./Wallette.tsx";

import "./index.css";
import "./lib/dayjs";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

const queryClient = new QueryClient();

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <Wallette />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
    <Toaster />
  </StrictMode>,
);
