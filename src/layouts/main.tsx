import { Outlet } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "../components/fragments/header";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { TransporterProvider } from "../components/providers/transporter-provider";

export default function MainLayout() {
  return (
    <TransporterProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <TransporterDialog />
    </TransporterProvider>
  );
}
