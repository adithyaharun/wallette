import { Outlet } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AssetDialog } from "../components/fragments/asset";
import { AssetCategoryDialog } from "../components/fragments/asset-category";
import { AppHeader } from "../components/fragments/header";
import { RecalculateDialog } from "../components/fragments/recalculate";
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
          <Outlet />
        </div>
      </SidebarInset>
      <TransporterDialog />
      <RecalculateDialog />
      <AssetCategoryDialog />
      <AssetDialog />
    </SidebarProvider>
  );
}
