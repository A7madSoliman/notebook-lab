import type { Task, TaskDate, TaskId } from "@/domain/tasks/task.types";
import { normalizeTaskRepositoryError } from "@/data/tasks/task-repository.errors";
import { createTaskRepository } from "@/data/tasks/task-repository.factory";

export type UpdateTaskDetailsResult =
  | { status: "success"; task: Task }
  | { status: "validation_error"; message: string }
  | { status: "error"; message: string };

/**
 * Validates whether a string is a real calendar date in YYYY-MM-DD format
 * using local calendar components without UTC conversions or external libraries.
 */
export function isValidDateInput(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) {
    return false;
  }
  if (day < 1 || day > 31) {
    return false;
  }

  // Construct local date to verify calendar validity including leap years
  const localDate = new Date(year, month - 1, day);
  return (
    localDate.getFullYear() === year &&
    localDate.getMonth() === month - 1 &&
    localDate.getDate() === day
  );
}

/**
 * Updates mutable fields (title and date) of an existing task via TaskRepository.update.
 *
 * Validates:
 * - Title is not whitespace-only (trimmed for validation; no max length or truncation).
 * - Date conforms to local YYYY-MM-DD format and represents a valid calendar date.
 *
 * Never alters completed, id, or timestamps.
 */
export async function updateTaskDetails(
  id: TaskId,
  input: { rawTitle: string; date: TaskDate }
): Promise<UpdateTaskDetailsResult> {
  const trimmedTitle = input.rawTitle.trim();

  if (trimmedTitle.length === 0) {
    return {
      status: "validation_error",
      message: "Please enter a task title.",
    };
  }

  if (!isValidDateInput(input.date)) {
    return {
      status: "validation_error",
      message: "Please enter a valid date in YYYY-MM-DD format.",
    };
  }

  try {
    const task = await createTaskRepository().update(id, {
      title: trimmedTitle,
      date: input.date,
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
      message: "Unable to update task. Please try again.",
    };
  }
}
