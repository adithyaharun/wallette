import { lazy } from "react";
import { createBrowserRouter } from "react-router";

// const AuthLayout = lazy(() => import("./layouts/auth"));
const ErrorLayout = lazy(() => import("./components/fragments/error-layout"));
const MainLayout = lazy(() => import("./layouts/main"));

// const LoginPage = lazy(() => import("./pages/auth/login/page"));
const BudgetIndexPage = lazy(() => import("./pages/budget/page"));
const DashboardPage = lazy(() => import("./pages/dashboard/page"));
// const SyncPage = lazy(() => import("./pages/sync/page"));
const TransactionFormPage = lazy(
  () => import("./pages/transactions/form/page"),
);
const TransactionPage = lazy(() => import("./pages/transactions/index/page"));
const TransactionDetailPage = lazy(
  () => import("./pages/transactions/detail/page"),
);

export const router = createBrowserRouter([
  {
    Component: MainLayout,
    errorElement: <ErrorLayout />,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "transactions",
        children: [
          {
            index: true,
            Component: TransactionPage,
          },
          {
            path: "form",
            Component: TransactionFormPage,
          },
          {
            path: "detail",
            Component: TransactionDetailPage,
          },
        ],
      },
      {
        path: "budgets",
        children: [
          {
            index: true,
            Component: BudgetIndexPage,
          },
        ],
      },
    ],
  },
]);
