import type { CustomerEntity } from "./customer.model";

let customers: CustomerEntity[] = [];

export class CustomerRepository {
  listCustomers(): CustomerEntity[] {
    return customers;
  }

  getCustomer(id: string): CustomerEntity | null {
    return customers.find((c) => c.id === id) || null;
  }

  seedIfEmpty(defaults: CustomerEntity[] = []) {
    if (customers.length === 0) customers = [...defaults];
  }
}