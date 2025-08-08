import { Outlet } from "react-router";
import { AssetProvider } from "./context";

export default function AssetLayout() {
  return (
    <AssetProvider>
      <Outlet />
    </AssetProvider>
  );
}
