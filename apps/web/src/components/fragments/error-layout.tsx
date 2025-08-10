import { useIsMobile } from "../../hooks/use-mobile";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AssetDialog } from "./asset";
import { AssetCategoryDialog } from "./asset-category";
import { RootErrorPage } from "./error";
import { AppHeader } from "./header";
import { RecalculateDialog } from "./recalculate";
import { TransporterDialog } from "./transporter/dialog";

export default function ErrorLayout() {
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
        <div className="flex flex-1 flex-col items-center justify-center pb-safe">
          <RootErrorPage />
        </div>
      </SidebarInset>
      <TransporterDialog />
      <RecalculateDialog />
      <AssetCategoryDialog />
      <AssetDialog />
    </SidebarProvider>
  );
}
