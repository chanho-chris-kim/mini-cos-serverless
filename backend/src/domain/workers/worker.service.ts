import type { Worker } from "../../types";
import { workerRepo } from "../sharedRepos";

export class WorkerService {
  getAll(): Worker[] {
    return workerRepo.listWorkers();
  }
}
