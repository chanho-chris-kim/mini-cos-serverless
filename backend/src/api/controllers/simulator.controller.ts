// backend/src/api/controllers/simulator.controller.ts
import type { Request, Response } from "express";
import { AssignmentService } from "../../domain/ai/assignment.service";
import { ALL_SKUS } from "../../utils/skuList";
import { pickRandomCanadianCityWeighted } from "../../domain/simulator/geo/canadaLocations";

const assignment = new AssignmentService();

/**
 * POST /simulator/orders
 * Secure external simulator entry
 */
export const generateSimulatedOrder = async (req: Request, res: Response) => {
  try {
    const simSecret = process.env.SIMULATOR_SHARED_SECRET;
    const headerKey = req.headers["x-simulator-key"] as string | undefined;

    console.log("[SIM-KEY] expected:", simSecret);
    console.log("[SIM-KEY] received:", headerKey);

    if (!simSecret) {
      console.error("SIMULATOR_SHARED_SECRET not set");
      return res.status(500).json({ error: "Simulator secret missing" });
    }

    if (!headerKey) {
      return res.status(403).json({ error: "Missing simulator key" });
    }

    if (headerKey !== simSecret) {
      return res.status(403).json({ error: "Invalid simulator key" });
    }

    const body = req.body;
    const incomingSkus =
      body?.boxes?.map((b: any) => b.sku) ??
      body?.items?.map((i: any) => i.sku) ??
      [];
    const invalid = incomingSkus.find((sku: any) => sku && !ALL_SKUS.includes(sku));
    if (invalid) {
      return res.status(400).json({ error: `Unknown SKU: ${invalid}` });
    }

    const result = await assignment.createIncomingOrder(body);

    return res.json({
      ok: true,
      order: result.order,
      warehouse: result.warehouse,
    });
  } catch (err: any) {
    console.error("Simulator order failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getRandomDestination = (_req: Request, res: Response) => {
  const { city, lat, lng } = pickRandomCanadianCityWeighted();
  res.json({
    destination: { lat, lng },
    city,
  });
};
