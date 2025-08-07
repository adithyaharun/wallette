import { Suspense } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AssetDialog } from "../components/fragments/asset";
import { AssetCategoryDialog } from "../components/fragments/asset-category";
import { AppHeader } from "../components/fragments/header";
import { RecalculateDialog } from "../components/fragments/recalculate";
import { TransactionCategoryDialog } from "../components/fragments/transaction-category";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { useIsMobile } from "../hooks/use-mobile";

export default function MainLayout() {
  const isMobile = useIsMobile();
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
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-current"></div>
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
