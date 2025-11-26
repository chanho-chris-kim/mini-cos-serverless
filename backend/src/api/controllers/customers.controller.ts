// backend/src/api/controllers/customers.controller.ts

import type { Request, Response } from "express";
import { CustomerRepository } from "../../domain/customers/customer.repository";

const repo = new CustomerRepository();

/** --------------------------------
 * GET /customers
 * -------------------------------- */
export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await repo.listCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /customers/:id
 * -------------------------------- */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await repo.getCustomer(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * POST /customers
 * Body: { id, name, email, homeAddress, deliveryAddress }
 * -------------------------------- */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = req.body;

    if (!customer.id || !customer.name || !customer.email) {
      return res
        .status(400)
        .json({ error: "id, name, and email are required" });
    }

    await repo.saveCustomer(customer);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * PATCH /customers/:id/deliveryAddress
 * -------------------------------- */
export const updateDeliveryAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = req.body;

    if (!address.line1) {
      return res.status(400).json({ error: "Invalid address" });
    }

    await repo.updateDeliveryAddress(id, address);

    res.json({ message: "deliveryAddress updated", id, address });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * PATCH /customers/:id/homeAddress
 * -------------------------------- */
export const updateHomeAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = req.body;

    if (!address.line1) {
      return res.status(400).json({ error: "Invalid address" });
    }

    await repo.updateHomeAddress(id, address);

    res.json({ message: "homeAddress updated", id, address });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
