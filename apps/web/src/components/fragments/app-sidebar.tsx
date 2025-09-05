import {
  Command,
  FileTextIcon,
  NotebookPenIcon,
  Send,
  Settings,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { NavAsset } from "@/components/fragments/nav/nav-asset";
import { NavGeneral } from "@/components/fragments/nav/nav-general";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "../../hooks/use-mobile";
import { useUI } from "../providers/ui-provider";
import { Skeleton } from "../ui/skeleton";
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
      url: "/budget",
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
  const location = useLocation();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const { isConfigLoading } = useUI();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to listen to route changes.
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, location.search, isMobile, setOpenMobile]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b md:border-0 px-2 md:px-0">
        <SidebarMenu>
          <div className="flex items-center justify-between gap-2 px-2 h-12 lg:h-16 border-t border-transparent">
            <div className="flex items-center gap-2">
              <img
                src="/wallette.webp"
                alt="Wallette Logo"
                className="size-7"
              />
              <span className="text-lg font-bold">Wallette.</span>
            </div>
            {!isMobile && <SidebarTrigger className="-ml-1.5" />}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isConfigLoading ? (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <NavGeneral items={menus.general} />
            <NavAsset />
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t md:border-0">
        {isConfigLoading ? (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <NavGeneral items={menus.support} className="mt-auto" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
