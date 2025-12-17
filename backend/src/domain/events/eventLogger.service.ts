import { randomUUID } from "crypto";
import type { WarehouseEventType, WarehouseEvent } from "../../types";
import { warehouseEventsRepo } from "./warehouseEvents.repository";
import { sseManager } from "./sseManager";

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
    warehouseEventsRepo.addEvent(event);
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
