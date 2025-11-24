import { Request, Response } from "express";
import { CustomerService } from "../../domain/customers/customer.service";

const service = new CustomerService();

export const getCustomers = (_req: Request, res: Response) => {
  res.json(service.getAll());
};
