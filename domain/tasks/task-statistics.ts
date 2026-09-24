import type { Task } from "./task.types";

export interface TaskStatistics {
  readonly total: number;
  readonly completed: number;
  readonly incomplete: number;
  readonly completionPercentage: number;
}

/**
 * Calculates domain statistics for a given collection of tasks.
 * Pure, reusable calculation without side effects or mutation.
 * completionPercentage is 0 when total is 0, otherwise (completed / total) * 100 without rounding.
 */
export function calculateTaskStatistics(
  tasks: readonly Task[]
): TaskStatistics {
  let completed = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
    }
  }

  const total = tasks.length;
  const incomplete = total - completed;
  const completionPercentage = total === 0 ? 0 : (completed / total) * 100;

  return {
    total,
    completed,
    incomplete,
    completionPercentage,
  };
}
