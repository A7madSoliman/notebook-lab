import type { TaskId } from "@/domain/tasks/task.types";
import { normalizeTaskRepositoryError } from "@/data/tasks/task-repository.errors";
import { createTaskRepository } from "@/data/tasks/task-repository.factory";

export type DeleteTaskResult =
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Deletes a task by id through the repository boundary.
 *
 * Calls TaskRepository.delete(id) directly with no existence pre-check.
 * Missing-id deletion resolves successfully (idempotent no-op per repository contract).
 */
export async function deleteTask(id: TaskId): Promise<DeleteTaskResult> {
  try {
    await createTaskRepository().delete(id);
    return { status: "success" };
  } catch (error: unknown) {
    const failure = normalizeTaskRepositoryError(error);

    if (failure === "corrupted-data") {
      return {
        status: "error",
        message:
          "Persisted task data is corrupted. Please review your local storage.",
      };
    }

    return {
      status: "error",
      message: "Unable to delete task. Please try again.",
    };
  }
}
