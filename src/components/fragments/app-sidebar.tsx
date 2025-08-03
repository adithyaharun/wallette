import { Command, FileTextIcon, Send, Settings, TagsIcon } from "lucide-react";
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
      icon: TagsIcon,
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
      <SidebarHeader className="border-b md:border-0">
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
      <SidebarFooter className="border-t md:border-0">
        <NavGeneral items={menus.support} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  );
}
