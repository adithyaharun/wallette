import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Separator } from "../../ui/separator";

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

interface MenuItemRendererProps {
  item: MenuItem;
  variant: "mobile" | "desktop";
  onAction?: () => void;
}

export function MenuItemRenderer({
  item,
  variant,
  onAction,
}: MenuItemRendererProps) {
  const navigate = useNavigate();
  const Icon = item.icon;

  if (item.separator) {
    return variant === "mobile" ? (
      <Separator className="my-2 -mx-4 !w-[calc(100%+3rem)]" />
    ) : (
      <DropdownMenuSeparator />
    );
  }

  const handleAction = () => {
    if (!item.action) return;

    switch (item.action.type) {
      case "route":
        navigate(item.action.path);
        break;
      case "url":
        window.open(item.action.url, "_blank");
        break;
      case "function":
        item.action.fn();
        break;
    }
    onAction?.();
  };

  if (item.action?.type === "component") {
    const Component = item.action.component;
    return (
      <Component>
        {variant === "mobile" ? (
          <Button variant="ghost" type="button" className="w-full">
            <Icon />
            {item.label}
          </Button>
        ) : (
          <DropdownMenuItem>
            <Icon />
            {item.label}
          </DropdownMenuItem>
        )}
      </Component>
    );
  }

  if (variant === "mobile") {
    if (item.action?.type === "route") {
      return (
        <Link to={item.action.path}>
          <Button variant="ghost" type="button" className="w-full">
            <Icon />
            {item.label}
          </Button>
        </Link>
      );
    }

    return (
      <Button variant="ghost" type="button" onClick={handleAction}>
        <Icon />
        {item.label}
      </Button>
    );
  }

  return (
    <DropdownMenuItem onClick={handleAction}>
      <Icon />
      {item.label}
    </DropdownMenuItem>
  );
}
