import { type Location, useLocation } from "react-router";
import { useUI } from "../providers/ui-provider";
import { SidebarTrigger } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

type PageData = {
  title: string | ((location: Location) => string);
  path: string | string[];
};

const pages: PageData[] = [
  {
    title: "Dashboard",
    path: ['/', "/dashboard"],
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
    title: "Asset Details",
    path: "/asset/:assetId",
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
      new URLSearchParams(location.search).has("id")
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
  const { isConfigLoading } = useUI();
  const location = useLocation();
  const currentPage = pages.find((page) => {
    const patterns = Array.isArray(page.path) ? page.path : [page.path];
    return patterns.some((path) => {
      const pattern = new RegExp(`^${path.replace(/:\w+/g, "[^/]+")}$`);
      return pattern.test(location.pathname);
    });
  });

  return (
    <header className="flex shrink-0 items-center gap-2 border-b pt-safe">
      {isConfigLoading ? (
        <div className="flex items-center gap-4 px-4 h-16">
          <Skeleton className="size-7" />
          <Skeleton className="h-7 w-32" />
        </div>
      ) : (
        <div className="flex items-center gap-4 px-4 h-16">
          <SidebarTrigger className="-ml-1.5" />
          <span className="text-lg font-bold">
            {typeof currentPage?.title === "function"
              ? currentPage?.title(location)
              : currentPage?.title}
          </span>
        </div>
      )}
    </header>
  );
}
