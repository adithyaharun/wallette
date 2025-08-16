import { Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AssetDialog } from "../components/fragments/asset";
import { AssetCategoryDialog } from "../components/fragments/asset-category";
import { AppHeader } from "../components/fragments/header";
import { RecalculateDialog } from "../components/fragments/recalculate";
import { TransactionCategoryDialog } from "../components/fragments/transaction-category";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { useUI } from "../components/providers/ui-provider";
import { Skeleton } from "../components/ui/skeleton";
import { useIsMobile } from "../hooks/use-mobile";
import { db } from "../lib/db";
import AboutDialog from "../components/fragments/about";

export function PageLoader() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-safe px-4 pt-4">
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { config, isConfigLoading } = useUI();

  useEffect(() => {
    if (isConfigLoading) {
      return;
    }

    const check = async () => {
      const existingAssets = await db.assets.count();
      const existingCategories = await db.assetCategories.count();

      if (!config || !config.setupCompleted) {
        if (existingAssets > 0 || existingCategories > 0) {
          navigate("/setup");
        } else {
          navigate("/welcome");
        }

        return;
      }
    };

    check();
  }, [navigate, config, isConfigLoading]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        style={{
          maxHeight: `calc(100vh - ${isMobile ? "0px" : "1rem"})`,
        }}
      >
        <AppHeader />
        {isConfigLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto pb-safe">
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
    </SidebarProvider>
  );
}
