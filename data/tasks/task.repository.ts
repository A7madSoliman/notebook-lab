import type {
  CreateTaskInput,
  Task,
  TaskDate,
  TaskDateRange,
  TaskId,
  UpdateTaskInput,
} from "@/domain/tasks/task.types";

/**
 * Task repository contract defining task storage operations.
 * Calendar-date range bounds are inclusive (`from` and `to`).
 * `listByDate(d)` is semantically equivalent to a same-day range `listByDateRange({ from: d, to: d })`.
 * Result ordering is an implementation detail and not a presentation contract.
 */
export interface TaskRepository {
  listByDate(date: TaskDate): Promise<Task[]>;
  listByDateRange(range: TaskDateRange): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: TaskId, input: UpdateTaskInput): Promise<Task>;
  delete(id: TaskId): Promise<void>;
}
