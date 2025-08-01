import { useLocation } from "react-router";
import { SidebarTrigger } from "../ui/sidebar";

const pages = [
  {
    title: "Dashboard",
    url: "/",
  },
  {
    title: "Budgets",
    url: "/budgets",
  },
  {
    title: "Transactions",
    url: "/transactions",
  },
];

export function AppHeader() {
  const { pathname } = useLocation();
  const currentPage = pages.find((page) => page.url === pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <span className="text-lg font-bold">{currentPage?.title}</span>
      </div>
    </header>
  );
}
