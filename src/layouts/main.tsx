import { Outlet } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "../components/fragments/header";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { TransporterProvider } from "../components/providers/transporter-provider";
import { useIsMobile } from "../hooks/use-mobile";

export default function MainLayout() {
  const isMobile = useIsMobile();
  return (
    <TransporterProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset
          style={{
            maxHeight: isMobile ? "100vh" : "calc(100vh - 1rem)",
          }}
        >
          <AppHeader />
          <div className="flex flex-1 flex-col overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <TransporterDialog />
    </TransporterProvider>
  );
}
