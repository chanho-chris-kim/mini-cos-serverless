import type { CustomerEntity } from "./customer.model";

let customers: CustomerEntity[] = [];

export class CustomerRepository {
  listCustomers(): CustomerEntity[] {
    return customers;
  }

  getAll(): CustomerEntity[] {
    return this.listCustomers();
  }

  getCustomer(id: string): CustomerEntity | null {
    return customers.find((c) => c.id === id) || null;
  }

  saveCustomer(customer: CustomerEntity): void {
    const existing = this.getCustomer(customer.id);
    if (existing) {
      Object.assign(existing, customer);
    } else {
      customers.push(customer);
    }
  }

  updateDeliveryAddress(id: string, address: any): void {
    const customer = this.getCustomer(id);
    if (!customer) return;
    (customer as any).deliveryAddress = address;
    this.saveCustomer(customer);
  }

  updateHomeAddress(id: string, address: any): void {
    const customer = this.getCustomer(id);
    if (!customer) return;
    (customer as any).homeAddress = address;
    this.saveCustomer(customer);
  }

  seedIfEmpty(defaults: CustomerEntity[] = []) {
    if (customers.length === 0) customers = [...defaults];
  }
}
