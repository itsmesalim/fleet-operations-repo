import { UserRole } from "../types";

export const ROLE_ACCESS = {
  dashboard: ["Admin", "Manager", "Operator"],
  routes: ["Admin", "Manager"],
  teams: ["Admin", "Manager", "Operator"],
  orders: ["Admin", "Manager", "Operator"],
  analytics: ["Admin", "Manager"],
  settings: ["Admin", "Manager", "Operator"],
} satisfies Record<string, UserRole[]>;
