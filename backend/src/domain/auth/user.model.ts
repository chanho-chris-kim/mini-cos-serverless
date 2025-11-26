// Simple internal user model for auth

export type Role =
  | "ADMIN"
  | "OPS_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "WORKER"
  | "QA"
  | "SUPPORT"
  | "ANALYTICS";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  warehouseId?: string;
  workerId?: string;
  // NOTE: stored as plain text for demo. In a real system, this would be a bcrypt hash.
  password: string;
}

// What we send back to frontend (no password)
export type PublicUser = Omit<AuthUser, "password">;
