import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { NavLink } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavGeneral({
  items,
  ...props
}: {
  items: {
    title: string;
    url?: string;
    icon: LucideIcon;
    content?: React.JSX.Element;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(
            (item) =>
              item.content ?? (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url ?? "#"} viewTransition>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        className="h-9 cursor-pointer"
                        isActive={isActive}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
