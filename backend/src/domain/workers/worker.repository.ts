import { workers } from "../../data/workers";
import type { WorkerEntity } from "./worker.model";

export class WorkerRepository {
  getAll(): WorkerEntity[] {
    return workers;
  }

  getById(id: string): WorkerEntity | undefined {
    return workers.find((w) => w.id === id);
  }

  save(worker: WorkerEntity): WorkerEntity {
    const index = workers.findIndex((w) => w.id === worker.id);
    if (index === -1) {
      workers.push(worker);
    } else {
      workers[index] = worker;
    }
    return worker;
  }
}
