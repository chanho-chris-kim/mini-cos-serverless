import { users } from "../../data/users";

export class AuthRepository {
  async findByEmail(email: string) {
    return users.find((u) => u.email === email) || null;
  }
}
