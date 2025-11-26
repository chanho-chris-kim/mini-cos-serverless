import type { User } from "./types";

export function getHomeRouteFor(user: User | null) {
  if (!user) return "/login";

  const roleRoutes: Record<string, string> = {
    ADMIN: "/dashboard",
    OPS_MANAGER: "/dashboard",
    WAREHOUSE_MANAGER: "/dashboard",
    WORKER: "/scan",
    QA: "/returns",
    SUPPORT: "/orders",
    ANALYTICS: "/analytics",
  };

  return roleRoutes[user.role] ?? "/dashboard";
}
