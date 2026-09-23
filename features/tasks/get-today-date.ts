import type { TaskDate } from "@/domain/tasks/task.types";

/**
 * Returns the current calendar date in `YYYY-MM-DD` format using local time getters.
 * Avoids toISOString() and UTC conversions to respect the user's local day.
 */
export function getTodayDate(now: Date = new Date()): TaskDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
