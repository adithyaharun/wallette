import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  );
}
