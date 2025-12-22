import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { CustomerEntity } from "./customer.model";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const DEFAULT_TABLE = "MiniCosCustomers";

export class DynamoCustomerRepo {
  private tableName = process.env.CUSTOMERS_TABLE || DEFAULT_TABLE;

  listCustomers(): CustomerEntity[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    return (res.Items as CustomerEntity[]) ?? [];
  }

  getAll(): CustomerEntity[] {
    return this.listCustomers();
  }

  getCustomer(id: string): CustomerEntity | null {
    const res = waitForPromise(
      dynamo.send(new GetCommand({ TableName: this.tableName, Key: { id } }))
    );
    return (res.Item as CustomerEntity) ?? null;
  }

  saveCustomer(customer: CustomerEntity): void {
    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: customer }))
    );
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
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName, Limit: 1 }))
    );
    if ((res.Items?.length ?? 0) === 0 && defaults.length > 0) {
      defaults.forEach((c) =>
        waitForPromise(
          dynamo.send(new PutCommand({ TableName: this.tableName, Item: c }))
        )
      );
    }
  }
}
