import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { AppSidebar } from "@/components/fragments/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppHeader } from "../components/fragments/header";
import { TransporterDialog } from "../components/fragments/transporter/dialog";
import { TransporterProvider } from "../components/providers/transporter-provider";
import { useAuthStore } from "../store/auth";

export function MainLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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
