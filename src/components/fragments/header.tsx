import { type Location, useLocation } from "react-router";
import { SidebarTrigger } from "../ui/sidebar";

type PageData = {
  title: string | ((location: Location) => string);
  path: string;
};

const pages: PageData[] = [
  {
    title: "Dashboard",
    path: "/",
  },
  {
    title: "Budgets",
    path: "/budgets",
  },
  {
    title: "Transactions",
    path: "/transactions",
  },
  {
    title: (location) =>
      location.search.includes("id=")
        ? "Edit Transaction"
        : "Add New Transaction",
    path: "/transactions/form",
  },
];

export function AppHeader() {
  const location = useLocation();
  const currentPage = pages.find((page) => page.path === location.pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-4 px-4">
        <SidebarTrigger className="-ml-1.5" />
        <span className="text-lg font-bold">
          {typeof currentPage?.title === "function"
            ? currentPage?.title(location)
            : currentPage?.title}
        </span>
      </div>
    </header>
  );
}
