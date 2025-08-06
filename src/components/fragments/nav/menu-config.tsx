import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDownIcon,
  MoonIcon,
  RotateCwIcon,
  SunIcon,
  TagsIcon,
} from "lucide-react";

export type MenuAction =
  | { type: "route"; path: string }
  | { type: "url"; url: string }
  | { type: "function"; fn: () => void }
  | {
      type: "component";
      component: React.ComponentType<{ children: React.ReactNode }>;
    };

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action?: MenuAction;
  separator?: boolean;
}

interface MenuConfigParams {
  setTransporterOpen: (open: boolean) => void;
  setRecalculatorOpen: (open: boolean) => void;
  theme: "light" | "dark" | "system";
  ThemeSwitcher: React.ComponentType<{ children: React.ReactNode }>;
}

export function createMenuConfig({
  setTransporterOpen,
  setRecalculatorOpen,
  theme,
  ThemeSwitcher,
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
  ];
}
