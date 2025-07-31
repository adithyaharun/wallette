import { Command, FileTextIcon, LifeBuoy, Send, TagsIcon } from "lucide-react";
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
import { AssetDialog } from "./asset";
import { NavUser } from "./nav/nav-user";

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
      icon: TagsIcon,
    },
  ],
  support: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
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
        <div className="px-4 md:px-2">
          <AssetDialog />
        </div>
        <NavAsset />
      </SidebarContent>
      <SidebarFooter>
        <NavGeneral items={menus.support} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
