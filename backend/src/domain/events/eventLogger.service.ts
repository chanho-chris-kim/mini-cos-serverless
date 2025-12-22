import { randomUUID } from "crypto";
import type { WarehouseEventType, WarehouseEvent } from "../../types";
import { warehouseEventsRepo as inMemoryWarehouseEventsRepo } from "./warehouseEvents.repository";
import { sseManager } from "./sseManager";

type WarehouseEventsRepoLike = {
  addEvent(event: WarehouseEvent): void;
  getEventsForWarehouse(warehouseId: string, limit?: number): WarehouseEvent[];
};

let eventsRepo: WarehouseEventsRepoLike = inMemoryWarehouseEventsRepo;

export function setWarehouseEventsRepo(repo: WarehouseEventsRepoLike) {
  eventsRepo = repo;
}

class EventLogger {
  log(
    warehouseId: string,
    type: WarehouseEventType,
    message: string,
    meta?: Record<string, any>
  ): void {
    const event: WarehouseEvent = {
      id: randomUUID(),
      warehouseId,
      type,
      message,
      timestamp: new Date().toISOString(),
      meta: meta ?? undefined,
    };
    eventsRepo.addEvent(event);
    sseManager.broadcastTo(warehouseId, event);
    sseManager.broadcastGlobal(event);
  }

  logReturnReceived(warehouseId: string, boxId: string) {
    this.log(warehouseId, "RETURN_RECEIVED", `Return received at ${warehouseId} (${boxId})`, {
      boxId,
    });
  }

  logReturnQAStart(warehouseId: string, boxId: string) {
    this.log(warehouseId, "RETURN_QA_STARTED", `QA started for ${boxId}`, { boxId });
  }

  logReturnClassified(warehouseId: string, boxId: string, category: string) {
    this.log(
      warehouseId,
      "RETURN_CLASSIFIED",
      `QA classified ${boxId}: ${category}`,
      { boxId, category }
    );
  }
}

export const eventLogger = new EventLogger();
