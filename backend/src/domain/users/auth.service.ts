import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "./user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // replace in production

export class AuthService {
  private repo = new UserRepository();

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { passwordHash, ...safeUser } = user;

    return { user: safeUser, token };
  }

  async verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}
