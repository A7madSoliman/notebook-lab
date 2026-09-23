import type { Task } from "@/domain/tasks/task.types";
import { normalizeTaskRepositoryError } from "@/data/tasks/task-repository.errors";
import { createTaskRepository } from "@/data/tasks/task-repository.factory";
import { getTodayDate } from "./get-today-date";

export type CreateTodayTaskResult =
  | { status: "success"; task: Task }
  | { status: "validation_error"; message: string }
  | { status: "error"; message: string };

/**
 * Creates a task for today's calendar date through the repository boundary.
 *
 * Title is intentionally trimmed to reject purely whitespace input and avoid
 * storing accidental outer whitespace. No arbitrary maximum length is enforced.
 * Date is computed at execution time to ensure alignment with user's local day.
 */
export async function createTodayTask(rawTitle: string): Promise<CreateTodayTaskResult> {
  const trimmedTitle = rawTitle.trim();

  if (trimmedTitle.length === 0) {
    return {
      status: "validation_error",
      message: "Please enter a task title.",
    };
  }

  const today = getTodayDate();

  try {
    const task = await createTaskRepository().create({
      title: trimmedTitle,
      date: today,
    });
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
      message: "Unable to create task. Please try again.",
    };
  }
}
