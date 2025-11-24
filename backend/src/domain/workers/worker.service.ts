import type { Worker } from "../../types";
import { WorkerRepository } from "./worker.repository";

export class WorkerService {
  private repo = new WorkerRepository();

  getAll(): Worker[] {
    return this.repo.getAll();
  }
}
