import type { Task, TaskDate } from "@/domain/tasks/task.types";
import { normalizeTaskRepositoryError } from "@/data/tasks/task-repository.errors";
import { createTaskRepository } from "@/data/tasks/task-repository.factory";

export type TodayTasksResult =
  | { status: "success"; tasks: Task[] }
  | { status: "error"; message: string };

/**
 * Loads one local calendar day and normalizes persistence failures for the UI.
 */
export async function loadTodayTasks(date: TaskDate): Promise<TodayTasksResult> {
  try {
    const tasks = await createTaskRepository().listByDate(date);
    return { status: "success", tasks };
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
      message: "Unable to load tasks for today. Please try again.",
    };
  }
}
