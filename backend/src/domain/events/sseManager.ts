import type { Response } from "express";
import type { WarehouseEvent } from "../../types";

class SSEManager {
  private clients: Map<string, Set<Response>> = new Map();
  private globalClients: Set<Response> = new Set();

  addClient(warehouseId: string | "ALL", res: Response, origin?: string) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    });

    if (warehouseId === "ALL") {
      this.globalClients.add(res);
    } else {
      if (!this.clients.has(warehouseId)) {
        this.clients.set(warehouseId, new Set());
      }
      this.clients.get(warehouseId)!.add(res);
    }

    res.write("event: ping\ndata: connected\n\n");
  }

  removeClient(warehouseId: string | "ALL", res: Response) {
    if (warehouseId === "ALL") {
      this.globalClients.delete(res);
    } else {
      this.clients.get(warehouseId)?.delete(res);
    }
  }

  private send(res: Response, event: WarehouseEvent) {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (err) {
      // Ignore broken pipe
    }
  }

  broadcastTo(warehouseId: string, event: WarehouseEvent) {
    this.clients.get(warehouseId)?.forEach((res) => this.send(res, event));
  }

  broadcastGlobal(event: WarehouseEvent) {
    this.globalClients.forEach((res) => this.send(res, event));
  }
}

export const sseManager = new SSEManager();
