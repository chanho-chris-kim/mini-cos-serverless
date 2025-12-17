// backend/src/api/controllers/integrations.controller.ts
import type { Request, Response } from "express";
import {
  IntegrationOrderService,
  type ExternalOrderPayload,
} from "../../domain/integrations/integration.service";
import { ALL_SKUS } from "../../utils/skuList";

const integrationService = new IntegrationOrderService();
const INTEGRATION_SECRET = process.env.INTEGRATION_SHARED_SECRET;

/**
 * POST /api/integrations/orders
 * Secure endpoint used by Shopify / web store / simulator to create orders.
 */
export const createExternalOrder = async (req: Request, res: Response) => {
  try {
    const headerKey = req.header("x-integration-key");

    if (!INTEGRATION_SECRET) {
      console.error(
        "INTEGRATION_SHARED_SECRET is not set in backend .env – refusing integration"
      );
      return res
        .status(500)
        .json({ error: "Integration secret not configured on server" });
    }

    if (!headerKey || headerKey !== INTEGRATION_SECRET) {
      return res.status(401).json({ error: "Invalid integration key" });
    }

    const payload = req.body as ExternalOrderPayload;

    const invalid = payload.items?.find((i) => !ALL_SKUS.includes(i.sku));
    if (invalid) {
      return res.status(400).json({ error: `Unknown SKU: ${invalid.sku}` });
    }

    const order = await integrationService.createCOSOrderFromExternal(payload);

    return res.status(201).json({
      ok: true,
      orderId: order.id,
      order,
    });
  } catch (err: any) {
    console.error("createExternalOrder failed:", err);
    return res
      .status(400)
      .json({ error: err?.message ?? "Failed to create external order" });
  }
};
