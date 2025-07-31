import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  );
}
