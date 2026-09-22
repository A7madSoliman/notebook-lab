import { LocalTaskRepositoryError } from "@/data/tasks/local-task.repository";

/**
 * Adapter-independent failure classification for task repository operations.
 */
export type TaskRepositoryFailure = "corrupted-data" | "unavailable";

/**
 * Normalizes underlying repository errors into adapter-independent failure categories.
 */
export function normalizeTaskRepositoryError(error: unknown): TaskRepositoryFailure {
  if (
    error instanceof LocalTaskRepositoryError &&
    error.code === "CORRUPTED_DATA"
  ) {
    return "corrupted-data";
  }

  return "unavailable";
}
