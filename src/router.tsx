import { lazy } from "react";
import { createBrowserRouter } from "react-router";

// const AuthLayout = lazy(() => import("./layouts/auth"));
const MainLayout = lazy(() => import("./layouts/main"));

// const LoginPage = lazy(() => import("./pages/auth/login/page"));
const BudgetIndexPage = lazy(() => import("./pages/budget/page"));
const DashboardPage = lazy(() => import("./pages/dashboard/page"));
// const SyncPage = lazy(() => import("./pages/sync/page"));
const TransactionFormPage = lazy(
  () => import("./pages/transactions/form/page"),
);
const TransactionPage = lazy(() => import("./pages/transactions/index/page"));

export const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "transactions",
        children: [
          {
            index: true,
            element: <TransactionPage />,
          },
          {
            path: "form",
            element: <TransactionFormPage />,
          },
        ],
      },
      {
        path: "budgets",
        children: [
          {
            index: true,
            element: <BudgetIndexPage />,
          },
        ],
      },
    ],
  },
]);
