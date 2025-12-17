// backend/src/domain/auth/user.model.ts

export type Role =
  | "ADMIN"
  | "OPS_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "WORKER"
  | "QA"
  | "SUPPORT"
  | "ANALYTICS"
  | "INTEGRATION";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  warehouseId?: string;
  workerId?: string;
  /** bcrypt hash of the password */
  passwordHash: string;
}

// What we expose to the frontend (no password)
export type PublicUser = Omit<AuthUser, "passwordHash">;
