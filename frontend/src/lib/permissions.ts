import type { User } from "./types";

export const routePermissions: Record<string, string[]> = {
  "/dashboard": ["ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "ANALYTICS"],
  "/orders": ["ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"],
  "/orders/:id": ["ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"],
  "/tasks": ["ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"],
  "/scan": ["WORKER", "OPS_MANAGER", "WAREHOUSE_MANAGER"],
  "/returns": ["QA", "OPS_MANAGER", "WAREHOUSE_MANAGER"],
  "/returns/:id": ["QA", "OPS_MANAGER", "WAREHOUSE_MANAGER", "ADMIN"],
  "/returns-dashboard": ["ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"],
  "/warehouses": ["ADMIN", "OPS_MANAGER"],
  "/warehouses/:id": ["ADMIN", "OPS_MANAGER"],
  "/workers": ["ADMIN", "OPS_MANAGER"],
  "/analytics": ["ADMIN", "OPS_MANAGER", "ANALYTICS"],
  "/ops": ["ADMIN"],
};

export function canAccess(user: User | null, path: string) {
  if (!user) return false;

  // find first matching route key
  const match = Object.keys(routePermissions).find((key) => {
    if (key.includes(":")) {
      // match dynamic route (e.g., "/orders/:id")
      const base = key.split("/:")[0];
      return path.startsWith(base);
    }
    return key === path;
  });

  if (!match) return false;

  return routePermissions[match].includes(user.role);
}
