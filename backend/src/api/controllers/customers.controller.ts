// backend/src/api/controllers/customers.controller.ts

import type { Request, Response } from "express";
import { customerRepo } from "../../domain/sharedRepos";

/** --------------------------------
 * GET /customers
 * -------------------------------- */
export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await customerRepo.listCustomers();
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
    const customer = await customerRepo.getCustomer(req.params.id);
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

    await customerRepo.saveCustomer(customer);
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

    await customerRepo.updateDeliveryAddress(id, address);

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

    await customerRepo.updateHomeAddress(id, address);

    res.json({ message: "homeAddress updated", id, address });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
