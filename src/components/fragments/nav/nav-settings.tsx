"use client";

import { ChevronsUpDownIcon, EllipsisIcon, SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useTheme, useUI } from "../../providers/ui-provider";
import { Button } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { ThemeSwitcher } from "../theme-switcher";
import { createMenuConfig } from "./menu-config";
import { MenuItemRenderer } from "./menu-item-renderer";

export function NavSettings() {
  const isMobile = useIsMobile();
  const { setTransporterOpen, setRecalculatorOpen } = useUI();
  const { theme } = useTheme();

  const menuItems = createMenuConfig({
    setTransporterOpen,
    setRecalculatorOpen,
    theme,
    ThemeSwitcher,
  });

  if (isMobile) {
    return (
      <SidebarMenuItem>
        <Drawer>
          <DrawerTrigger asChild>
            <SidebarMenuButton className="cursor-pointer">
              <EllipsisIcon />
              <span>More</span>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              {menuItems.map((item) => (
                <MenuItemRenderer key={item.id} item={item} variant="mobile" />
              ))}
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="cursor-pointer">
            <EllipsisIcon />
            <span>More</span>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          {menuItems.map((item) => (
            <MenuItemRenderer key={item.id} item={item} variant="desktop" />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
