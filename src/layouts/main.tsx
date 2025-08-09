import { Loader2Icon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AssetDialog } from "../components/fragments/asset";
import { AssetCategoryDialog } from "../components/fragments/asset-category";
import { AppHeader } from "../components/fragments/header";
import { RecalculateDialog } from "../components/fragments/recalculate";
import { TransactionCategoryDialog } from "../components/fragments/transaction-category";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { useIsMobile } from "../hooks/use-mobile";
import { db } from "../lib/db";

export default function MainLayout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSettings() {
      const config = await db.config.get(1);

      if (!config || !config.setupCompleted) {
        navigate("/welcome");
        return;
      }

      setReady(true);
    }

    checkSettings();
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2Icon className="size-12 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        style={{
          maxHeight: `calc(100vh - ${isMobile ? "0px" : "1rem"})`,
        }}
      >
        <AppHeader />
        <div className="flex flex-1 flex-col overflow-y-auto pb-safe">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Loader2Icon className="h-12 animate-spin" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
      <TransporterDialog />
      <RecalculateDialog />
      <TransactionCategoryDialog />
      <AssetCategoryDialog />
      <AssetDialog />
    </SidebarProvider>
  );
}
