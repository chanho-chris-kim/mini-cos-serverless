import type { AuthUser, Role } from "./user.model";

// In a real app this would be stored in DynamoDB / RDS and provisioned by HR/IT.
// For now: in-memory "HR seeded" users.

const users: AuthUser[] = [
  {
    id: "u-admin",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN",
    warehouseId: "wh1",
    password: "admin123",
  },
  {
    id: "u-ops",
    email: "ops@example.com",
    name: "Ops Manager",
    role: "OPS_MANAGER",
    warehouseId: "wh1",
    password: "password123",
  },
  {
    id: "u-wh-manager",
    email: "wh-manager@example.com",
    name: "Warehouse Manager",
    role: "WAREHOUSE_MANAGER",
    warehouseId: "wh1",
    password: "password123",
  },
  {
    id: "u-worker",
    email: "worker@example.com",
    name: "Warehouse Picker",
    role: "WORKER",
    warehouseId: "wh1",
    workerId: "w1",
    password: "password123",
  },
  {
    id: "u-qa",
    email: "qa@example.com",
    name: "QA Specialist",
    role: "QA",
    warehouseId: "wh1",
    workerId: "w2",
    password: "password123",
  },
  {
    id: "u-support",
    email: "support@example.com",
    name: "Customer Support",
    role: "SUPPORT",
    password: "password123",
  },
  {
    id: "u-analytics",
    email: "analytics@example.com",
    name: "Analytics",
    role: "ANALYTICS",
    password: "password123",
  },
];

export class UserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
