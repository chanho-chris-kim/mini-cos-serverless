// backend/src/domain/auth/auth.service.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository";
import type { PublicUser, AuthUser } from "./user.model";

const userRepo = new UserRepository();

const JWT_SECRET = process.env.JWT_SECRET || "dev-mini-cos-secret";
const JWT_EXPIRES_IN = "1h";

export interface LoginResult {
  user: PublicUser;
  token: string;
}

export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  warehouseId?: string;
  workerId?: string;
}

function toPublicUser(user: AuthUser): PublicUser {
  // strip passwordHash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // bcrypt password verification
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new Error("Invalid credentials");
    }

    const claims: JwtClaims = {
      sub: user.id,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouseId,
      workerId: user.workerId,
    };

    const token = jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      user: toPublicUser(user),
      token,
    };
  }

  verifyToken(token: string): JwtClaims {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtClaims;
    return decoded;
  }
}
