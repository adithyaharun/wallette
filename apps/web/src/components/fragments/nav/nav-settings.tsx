"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  ArrowUpDownIcon,
  ChevronsUpDownIcon,
  CogIcon,
  EllipsisIcon,
  InfoIcon,
  MoonIcon,
  RotateCwIcon,
  SunIcon,
  TagsIcon,
} from "lucide-react";
import { useNavigate, type NavigateFunction } from "react-router";
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
import type { MenuItem } from "./menu-item-renderer";
import { MenuItemRenderer } from "./menu-item-renderer";

interface MenuConfigParams {
  isMobile: boolean;
  setTransporterOpen: (open: boolean) => void;
  setRecalculatorOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
  theme: "light" | "dark" | "system";
  ThemeSwitcher: React.ComponentType<{ children: React.ReactNode }>;
  navigate: NavigateFunction;
}

function createMenuConfig({
  isMobile,
  setTransporterOpen,
  setRecalculatorOpen,
  setAboutOpen,
  theme,
  ThemeSwitcher,
  navigate,
}: MenuConfigParams): MenuItem[] {
  return [
    {
      id: "asset-categories",
      label: "Asset Categories",
      icon: TagsIcon,
      action: { type: "route", path: "/asset-categories" },
    },
    {
      id: "transaction-categories",
      label: "Transaction Categories",
      icon: TagsIcon,
      action: { type: "route", path: "/transaction-categories" },
    },
    {
      id: "separator-1",
      label: "",
      icon: TagsIcon,
      separator: true,
    },
    {
      id: "recalculate",
      label: "Recalculate",
      icon: RotateCwIcon,
      action: { type: "function", fn: () => setRecalculatorOpen(true) },
    },
    {
      id: "export-import",
      label: "Export/Import",
      icon: ArrowUpDownIcon,
      action: { type: "function", fn: () => setTransporterOpen(true) },
    },
    {
      id: "theme",
      label: "Change Theme",
      icon: theme === "light" ? SunIcon : MoonIcon,
      action: { type: "component", component: ThemeSwitcher },
    },
    {
      id: "separator-2",
      label: "",
      icon: TagsIcon,
      separator: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: CogIcon,
      action: {
        type: "function",
        fn: () => (isMobile ? navigate("/settings") : setAboutOpen(true)),
      },
    },
    {
      id: "separator-3",
      label: "",
      icon: TagsIcon,
      separator: true,
    },
    {
      id: "about",
      label: "About",
      icon: InfoIcon,
      action: { type: "function", fn: () => setAboutOpen(true) },
    },
  ];
}

export function NavSettings() {
  const isMobile = useIsMobile();
  const { setTransporterOpen, setRecalculatorOpen, setAboutOpen } = useUI();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const menuItems = createMenuConfig({
    setTransporterOpen,
    setRecalculatorOpen,
    setAboutOpen,
    theme,
    ThemeSwitcher,
    navigate,
    isMobile,
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
              <DrawerTitle>Available Settings</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              {menuItems.map((item) => (
                <MenuItemRenderer key={item.id} item={item} variant="mobile" />
              ))}
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
