// backend/src/domain/auth/user.repository.ts
import bcrypt from "bcryptjs";
import type { AuthUser, Role } from "./user.model";

// Plain-text seed (dev only). These are never stored directly — we hash them below.
const seedPlain = [
  {
    id: "u-admin",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN" as Role,
    warehouseId: "wh1",
    workerId: undefined,
    password: "admin123",
  },
  {
    id: "u-ops",
    email: "ops@example.com",
    name: "Ops Manager",
    role: "OPS_MANAGER" as Role,
    warehouseId: "wh1",
    workerId: undefined,
    password: "password123",
  },
  {
    id: "u-wh-manager",
    email: "wh-manager@example.com",
    name: "Warehouse Manager",
    role: "WAREHOUSE_MANAGER" as Role,
    warehouseId: "wh1",
    workerId: undefined,
    password: "password123",
  },
  {
    id: "u-worker",
    email: "worker@example.com",
    name: "Warehouse Picker",
    role: "WORKER" as Role,
    warehouseId: "wh1",
    workerId: "w1",
    password: "password123",
  },
  {
    id: "u-qa",
    email: "qa@example.com",
    name: "QA Specialist",
    role: "QA" as Role,
    warehouseId: "wh1",
    workerId: "w2",
    password: "password123",
  },
  {
    id: "u-support",
    email: "support@example.com",
    name: "Customer Support",
    role: "SUPPORT" as Role,
    warehouseId: undefined,
    workerId: undefined,
    password: "password123",
  },
  {
    id: "u-analytics",
    email: "analytics@example.com",
    name: "Analytics",
    role: "ANALYTICS" as Role,
    warehouseId: undefined,
    workerId: undefined,
    password: "password123",
  },
  {
    id: "u-integration",
    email: "integration@cozey-os.internal",
    name: "Channel Integration",
    role: "INTEGRATION",
    password: "integration-secret",
  },
];

// Hash once at startup (dev-only cost, fine)
const users: AuthUser[] = seedPlain.map((u) => ({
  id: u.id,
  email: u.email.toLowerCase(),
  name: u.name,
  role: u.role,
  warehouseId: u.warehouseId,
  workerId: u.workerId,
  passwordHash: bcrypt.hashSync(u.password, 10),
}));

export class UserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = users.find((u) => u.email === email.toLowerCase());
    return user || null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = users.find((u) => u.id === id);
    return user || null;
  }

  async list(): Promise<AuthUser[]> {
    return users;
  }

  // For future: this is where HR/IT "provision user" logic would go.
  async createUser(user: AuthUser): Promise<void> {
    users.push(user);
  }
}
