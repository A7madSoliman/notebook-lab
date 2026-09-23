import type { Task, TaskId } from "@/domain/tasks/task.types";
import { normalizeTaskRepositoryError } from "@/data/tasks/task-repository.errors";
import { createTaskRepository } from "@/data/tasks/task-repository.factory";

export type UpdateTaskCompletionResult =
  | { status: "success"; task: Task }
  | { status: "error"; message: string };

export async function updateTaskCompletion(
  id: TaskId,
  completed: boolean
): Promise<UpdateTaskCompletionResult> {
  try {
    const task = await createTaskRepository().update(id, { completed });
    return { status: "success", task };
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
      message: "Unable to update task. Please try again.",
    };
  }
}
