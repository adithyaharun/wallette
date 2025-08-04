"use client";

// import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDownIcon,
  // CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  RotateCwIcon,
  // LogOutIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useTheme } from "../../providers/theme-provider";
// import { db } from "../../../lib/db";
// import { useAuthStore } from "../../../store/auth";
import { useTransporter } from "../../providers/transporter-provider";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import {
  Drawer,
  DrawerClose,
  // DrawerClose,
  DrawerContent,
  // DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  // DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { ThemeSwitcher } from "../theme-switcher";

export function NavSettings() {
  const isMobile = useIsMobile();
  const { setTransporterOpen, setRecalculatorOpen } = useTransporter();
  const { theme } = useTheme();
  // const { user, logout } = useAuthStore();
  // const queryClient = useQueryClient();

  // const labels = {
  //   confirmTitle: "End Session",
  //   confirmDescription:
  //     user?.id === "local-user"
  //       ? "Are you sure you want to end the session? Your financial data will be permanently lost if you haven't exported it."
  //       : "Are you sure you want to end the session?",
  //   cancel: "Cancel",
  //   logout: "End Session",
  // };

  // const onLogout = async () => {
  //   await db.delete();
  //   db.close();
  //   queryClient.clear();

  //   logout();
  // };

  if (isMobile) {
    return (
      <SidebarMenuItem>
        <Drawer>
          <DrawerTrigger asChild>
            <SidebarMenuButton className="cursor-pointer">
              <SettingsIcon />
              <span>Settings</span>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setRecalculatorOpen(true)}
              >
                <RotateCwIcon />
                Recalculate
              </Button>
              <Button
                variant="outline"
                onClick={() => setTransporterOpen(true)}
              >
                <ArrowUpDownIcon />
                Export/Import
              </Button>
              <ThemeSwitcher>
                <Button variant="outline" type="button">
                  {theme === "light" ? <SunIcon /> : <MoonIcon />}
                  Change Theme
                </Button>
              </ThemeSwitcher>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
              {/* <Drawer>
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
                </Drawer> */}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      {/* <AlertDialog> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="cursor-pointer">
            <SettingsIcon />
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
          {/* <DropdownMenuLabel className="p-0 font-normal">
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
              <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => setRecalculatorOpen(true)}>
            <RotateCwIcon />
            Recalculate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTransporterOpen(true)}>
            <ArrowUpDownIcon />
            Export/Import
          </DropdownMenuItem>
          <ThemeSwitcher>
            <DropdownMenuItem>
              {theme === "light" ? <SunIcon /> : <MoonIcon />}
              Theme
            </DropdownMenuItem>
          </ThemeSwitcher>
          {/* <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  <LogOutIcon />
                  {labels.logout}
                </DropdownMenuItem>
              </AlertDialogTrigger> */}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <AlertDialogContent>
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
          </AlertDialogContent> */}
      {/* </AlertDialog> */}
    </SidebarMenuItem>
  );
}
