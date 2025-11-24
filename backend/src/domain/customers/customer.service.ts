import type { Customer } from "../../types";
import { CustomerRepository } from "./customer.repository";

export class CustomerService {
  private repo = new CustomerRepository();

  getAll(): Customer[] {
    return this.repo.getAll();
  }
}
