/**
 * Unique identifier for a task.
 */
export type TaskId = string;

/**
 * User-local calendar day in `YYYY-MM-DD` format with no time component or timezone offset.
 */
export type TaskDate = string;

/**
 * Task domain entity representing a planned or completed work item.
 * Timestamps (createdAt and updatedAt) are ISO-8601 instant strings (e.g. UTC ISO string).
 */
export interface Task {
  id: TaskId;
  title: string;
  completed: boolean;
  date: TaskDate;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input required to create a new task.
 * Repository and persistence layers own generated fields (id, timestamps),
 * and new tasks always start incomplete.
 */
export interface CreateTaskInput {
  title: string;
  date: TaskDate;
}

/**
 * Explicit partial patch representation for updating an existing task.
 * Does not expose id or timestamps.
 * Empty-patch and missing-id failure semantics are intentionally deferred to T02.
 */
export interface UpdateTaskInput {
  title?: string;
  date?: TaskDate;
  completed?: boolean;
}

/**
 * Calendar date range with inclusive boundaries.
 * Callers provide `from <= to` in lexicographic `YYYY-MM-DD` order.
 */
export interface TaskDateRange {
  from: TaskDate;
  to: TaskDate;
}
