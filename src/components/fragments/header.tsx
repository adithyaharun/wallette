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
    path: "/budget",
  },
  {
    title: "Budget Details",
    path: "/budget/:budgetId",
  },
  {
    title: "Transactions",
    path: "/transactions",
  },
  {
    title: "Asset Categories",
    path: "/asset-categories",
  },
  {
    title: "Transaction Categories",
    path: "/transaction-categories",
  },
  {
    title: (location) =>
      location.search.includes("id=")
        ? "Edit Transaction"
        : "Add New Transaction",
    path: "/transactions/form",
  },
  {
    title: "Transaction Details",
    path: "/transactions/detail",
  },
];

export function AppHeader() {
  const location = useLocation();
  const currentPage = pages.find((page) => {
    const pattern = new RegExp(`^${page.path.replace(/:\w+/g, "[^/]+")}$`);
    return pattern.test(location.pathname);
  });

  return (
    <header className="flex shrink-0 items-center gap-2 border-b pt-safe">
      <div className="flex items-center gap-4 px-4 h-16">
        <SidebarTrigger className="-ml-1.5" />
        <span className="text-xl font-bold">
          {typeof currentPage?.title === "function"
            ? currentPage?.title(location)
            : currentPage?.title}
        </span>
      </div>
    </header>
  );
}
