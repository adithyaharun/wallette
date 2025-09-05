import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AboutDialog from "../components/fragments/about";
import { AssetDialog } from "../components/fragments/asset";
import { AssetCategoryDialog } from "../components/fragments/asset-category";
import { AppHeader } from "../components/fragments/header";
import { RecalculateDialog } from "../components/fragments/recalculate";
import { TransactionCategoryDialog } from "../components/fragments/transaction-category";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { WelcomeSetupDialog } from "../components/fragments/welcome-setup-dialog";
import { useUI } from "../components/providers/ui-provider";
import { Skeleton } from "../components/ui/skeleton";

export function PageLoader() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-container">
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full" />
        <div className="flex space-x-4">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { config, isConfigLoading } = useUI();
  const [showWelcomeSetup, setShowWelcomeSetup] = useState(false);

  useEffect(() => {
    if (isConfigLoading) {
      return;
    }

    if (!config || !config.setupCompleted) {
      setShowWelcomeSetup(true);
    } else {
      setShowWelcomeSetup(false);
    }
  }, [config, isConfigLoading]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {isConfigLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto py-container">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        )}
      </SidebarInset>
      <TransporterDialog />
      <RecalculateDialog />
      <TransactionCategoryDialog />
      <AssetCategoryDialog />
      <AssetDialog />
      <AboutDialog />
      <WelcomeSetupDialog
        isOpen={showWelcomeSetup}
        onClose={() => setShowWelcomeSetup(false)}
      />
    </SidebarProvider>
  );
}
