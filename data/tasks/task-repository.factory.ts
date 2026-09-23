import type { TaskRepository } from "@/data/tasks/task.repository";
import { LocalTaskRepository } from "@/data/tasks/local-task.repository";

/**
 * Composes the repository implementation used by the task feature.
 */
export function createTaskRepository(): TaskRepository {
  return new LocalTaskRepository();
}
