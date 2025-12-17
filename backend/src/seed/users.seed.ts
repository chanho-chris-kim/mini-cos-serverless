import type { AuthUser } from "../domain/auth/user.model";
import bcrypt from "bcryptjs";

export const userSeeds: AuthUser[] = [
  {
    id: "u-admin",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN",
    warehouseId: "wh1",
    passwordHash: bcrypt.hashSync("admin123", 10)
  },
  {
    id: "integration-simulator",
    email: "simulator@internal.local",
    name: "Simulator Engine",
    role: "SIMULATOR",
    passwordHash: bcrypt.hashSync("SIMULATOR_TOKEN", 10)
  }
];
