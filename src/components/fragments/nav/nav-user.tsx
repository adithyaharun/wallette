"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDownIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "../../../hooks/use-mobile";
import { db } from "../../../lib/db";
import { useAuthStore } from "../../../store/auth";
import { useTransporter } from "../../providers/transporter-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";

export function NavUser() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { setTransporterOpen } = useTransporter();
  const { user, logout } = useAuthStore();

  console.log("NavUser", { user });

  const labels = {
    confirmTitle: "End Session",
    confirmDescription:
      user?.id === "local-user"
        ? "Are you sure you want to end the session? Your financial data will be permanently lost if you haven't exported it."
        : "Are you sure you want to end the session?",
    cancel: "Cancel",
    logout: "End Session",
  };

  const onLogout = async () => {
    await db.delete();
    db.close();
    queryClient.clear();

    logout();
  };

  if (isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Drawer>
            <DrawerTrigger asChild>
              <SidebarMenuButton className="cursor-pointer">
                <SettingsIcon className="size-4" />
                <span>Settings</span>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.picture || ""} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name}</span>
              </DrawerHeader>
              <DrawerFooter>
                <Button onClick={() => setTransporterOpen(true)}>
                  <ArrowUpDownIcon className="size-4" />
                  Export/Import
                </Button>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="destructive">{labels.logout}</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>{labels.confirmTitle}</DrawerTitle>
                      <DrawerDescription>
                        {labels.confirmDescription}
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button variant="destructive" onClick={onLogout}>
                        {labels.logout}
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline">{labels.cancel}</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="cursor-pointer">
                <SettingsIcon className="size-4" />
                <span>Settings</span>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.picture || ""} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="truncate font-medium text-left text-sm leading-tight">
                      {user?.name}
                    </span>
                    {user?.id === "local-user" ? (
                      <span className="text-xs text-muted-foreground">
                        Sync Disabled
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckIcon className="size-3" />
                        <span className="text-xs">Sync Enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTransporterOpen(true)}>
                <ArrowUpDownIcon className="size-4" />
                Export/Import
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  <LogOutIcon className="size-4" />
                  {labels.logout}
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{labels.logout}</AlertDialogTitle>
              <AlertDialogDescription>
                {labels.confirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="gap-2 flex justify-end">
              <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onLogout}>
                {labels.logout}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
