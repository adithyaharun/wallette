import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("policies", [route(":page", "routes/policies/[page].tsx")]),
] satisfies RouteConfig;
