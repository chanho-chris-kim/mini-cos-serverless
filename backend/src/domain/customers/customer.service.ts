import type { Customer } from "../../types";
import { customerRepo } from "../sharedRepos";

export class CustomerService {
  private repo = customerRepo;

  getAll(): Customer[] {
    return this.repo.getAll();
  }
}
