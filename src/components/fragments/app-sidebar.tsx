import {
  Command,
  FileTextIcon,
  NotebookPenIcon,
  Send,
  Settings,
} from "lucide-react";
import type * as React from "react";
import { NavAsset } from "@/components/fragments/nav/nav-asset";
import { NavGeneral } from "@/components/fragments/nav/nav-general";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavSettings } from "./nav/nav-settings";

const menus = {
  general: [
    {
      title: "Dashboard",
      url: "/",
      icon: Command,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: FileTextIcon,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: NotebookPenIcon,
    },
  ],
  support: [
    {
      title: "Feedback",
      url: "https://github.com/adithyaharun/wallette/issues/new",
      icon: Send,
    },
    {
      title: "Settings",
      icon: Settings,
      content: <NavSettings />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b md:border-0 pt-safe px-2 md:px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <img
                  src="/wallette.webp"
                  alt="Wallette Logo"
                  className="size-7"
                />
                <span className="text-lg font-bold">Wallette.</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGeneral items={menus.general} />
        <NavAsset />
      </SidebarContent>
      <SidebarFooter className="border-t md:border-0 pb-safe">
        <NavGeneral items={menus.support} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  );
}
