import { customers } from "../../data/customers";
import type { CustomerEntity } from "./customer.model";

export class CustomerRepository {
  getAll(): CustomerEntity[] {
    return customers;
  }

  getById(id: string): CustomerEntity | undefined {
    return customers.find((c) => c.id === id);
  }
}
