import type {
  CreateTaskInput,
  Task,
  TaskDate,
  TaskDateRange,
  TaskId,
  UpdateTaskInput,
} from "@/domain/tasks/task.types";
import type { TaskRepository } from "@/data/tasks/task.repository";

/**
 * Persisted storage key used by the local task repository.
 */
export const LOCAL_TASKS_STORAGE_KEY = "notebook-lab.tasks.v1";

/**
 * Stable error codes emitted across the local persistence boundary.
 */
export type LocalTaskErrorCode =
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_READ_FAILED"
  | "STORAGE_WRITE_FAILED"
  | "CORRUPTED_DATA"
  | "TASK_NOT_FOUND"
  | "INVALID_INPUT"
  | "INVALID_DATE_RANGE";

/**
 * Typed error class representing failure conditions at the local storage boundary.
 */
export class LocalTaskRepositoryError extends Error {
  readonly code: LocalTaskErrorCode;
  readonly cause?: unknown;

  constructor(code: LocalTaskErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "LocalTaskRepositoryError";
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Minimal structural storage boundary interface to allow dependency injection.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Validates whether a string is a real calendar date in YYYY-MM-DD format.
 */
function isValidCalendarDate(value: unknown): value is TaskDate {
  if (typeof value !== "string") {
    return false;
  }
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

  // Construct UTC date to verify calendar validity including leap years
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
}

/**
 * Validates whether a string is a parseable ISO-8601 instant timestamp
 * with real calendar dates and valid time components.
 */
function isValidIsoInstant(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(
      value
    );
  if (!match) {
    return false;
  }

  const datePart = match[1];
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);

  // Reject impossible calendar dates (e.g. 2026-02-30)
  if (!isValidCalendarDate(datePart)) {
    return false;
  }

  // Time components validation (hours 0-23, minutes 0-59, seconds 0-59)
  if (hours < 0 || hours > 23) {
    return false;
  }
  if (minutes < 0 || minutes > 59) {
    return false;
  }
  if (seconds < 0 || seconds > 59) {
    return false;
  }

  // If numeric timezone offset is present, validate offset hours (0-23) and minutes (0-59)
  if (match[6] !== undefined && match[7] !== undefined) {
    const offsetHours = Number(match[6]);
    const offsetMinutes = Number(match[7]);
    if (offsetHours < 0 || offsetHours > 23 || offsetMinutes < 0 || offsetMinutes > 59) {
      return false;
    }
  }

  // Must also parse to a valid timestamp number
  const time = Date.parse(value);
  return !Number.isNaN(time);
}

/**
 * Validates that an arbitrary record satisfies the full Task domain contract.
 */
function isValidTaskRecord(record: unknown): record is Task {
  if (typeof record !== "object" || record === null) {
    return false;
  }

  const candidate = record as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    isValidCalendarDate(candidate.date) &&
    isValidIsoInstant(candidate.createdAt) &&
    isValidIsoInstant(candidate.updatedAt)
  );
}

/**
 * Collision-resistant fallback id generation when crypto.randomUUID is absent.
 */
function generateFallbackId(): string {
  const time = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 10);
  return `task_${time}_${randomPart}${randomPart2}`;
}

/**
 * Generates a unique task identifier.
 */
function generateTaskId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return generateFallbackId();
}

/**
 * Local browser localStorage implementation of the TaskRepository contract.
 */
export class LocalTaskRepository implements TaskRepository {
  private readonly injectedStorage?: KeyValueStorage;

  constructor(storage?: KeyValueStorage) {
    this.injectedStorage = storage;
  }

  /**
   * Resolves storage lazily per operation, guarding against SSR environments.
   */
  private getStorage(): KeyValueStorage {
    if (this.injectedStorage) {
      return this.injectedStorage;
    }

    if (typeof window === "undefined") {
      throw new LocalTaskRepositoryError(
        "STORAGE_UNAVAILABLE",
        "Storage is unavailable: window is undefined."
      );
    }

    try {
      const storage = window.localStorage;
      if (!storage) {
        throw new LocalTaskRepositoryError(
          "STORAGE_UNAVAILABLE",
          "Storage is unavailable: window.localStorage is not accessible."
        );
      }
      return storage;
    } catch (err) {
      if (err instanceof LocalTaskRepositoryError) {
        throw err;
      }
      throw new LocalTaskRepositoryError(
        "STORAGE_UNAVAILABLE",
        "Storage is unavailable: accessing window.localStorage failed.",
        err
      );
    }
  }

  /**
   * Reads raw data from storage and fully validates all records.
   */
  private readAll(): Task[] {
    const storage = this.getStorage();
    let raw: string | null;

    try {
      raw = storage.getItem(LOCAL_TASKS_STORAGE_KEY);
    } catch (err) {
      throw new LocalTaskRepositoryError(
        "STORAGE_READ_FAILED",
        `Failed to read from storage key "${LOCAL_TASKS_STORAGE_KEY}".`,
        err
      );
    }

    if (raw === null) {
      return [];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new LocalTaskRepositoryError(
        "CORRUPTED_DATA",
        "Persisted tasks data is not valid JSON.",
        err
      );
    }

    if (!Array.isArray(parsed)) {
      throw new LocalTaskRepositoryError(
        "CORRUPTED_DATA",
        "Persisted tasks data is not a JSON array."
      );
    }

    for (const item of parsed) {
      if (!isValidTaskRecord(item)) {
        throw new LocalTaskRepositoryError(
          "CORRUPTED_DATA",
          "Persisted task array contains one or more invalid task records."
        );
      }
    }

    return parsed as Task[];
  }

  /**
   * Serializes tasks and writes to storage.
   */
  private writeAll(tasks: Task[]): void {
    const storage = this.getStorage();
    let serialized: string;

    try {
      serialized = JSON.stringify(tasks);
    } catch (err) {
      throw new LocalTaskRepositoryError(
        "STORAGE_WRITE_FAILED",
        "Failed to serialize tasks to JSON.",
        err
      );
    }

    try {
      storage.setItem(LOCAL_TASKS_STORAGE_KEY, serialized);
    } catch (err) {
      throw new LocalTaskRepositoryError(
        "STORAGE_WRITE_FAILED",
        `Failed to write tasks to storage key "${LOCAL_TASKS_STORAGE_KEY}".`,
        err
      );
    }
  }

  async listByDate(date: TaskDate): Promise<Task[]> {
    if (!isValidCalendarDate(date)) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        `Invalid date parameter: "${String(date)}". Expected YYYY-MM-DD calendar date.`
      );
    }

    const tasks = this.readAll();
    return tasks.filter((task) => task.date === date);
  }

  async listByDateRange(range: TaskDateRange): Promise<Task[]> {
    if (
      typeof range !== "object" ||
      range === null ||
      !isValidCalendarDate(range.from) ||
      !isValidCalendarDate(range.to)
    ) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid range parameters: from and to must be valid YYYY-MM-DD calendar dates."
      );
    }

    if (range.from > range.to) {
      throw new LocalTaskRepositoryError(
        "INVALID_DATE_RANGE",
        `Invalid date range: "from" date (${range.from}) cannot be after "to" date (${range.to}).`
      );
    }

    const tasks = this.readAll();
    return tasks.filter(
      (task) => task.date >= range.from && task.date <= range.to
    );
  }

  async create(input: CreateTaskInput): Promise<Task> {
    if (
      typeof input !== "object" ||
      input === null ||
      typeof input.title !== "string" ||
      !isValidCalendarDate(input.date)
    ) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid task creation input: title must be a string and date must be a valid YYYY-MM-DD calendar date."
      );
    }

    const tasks = this.readAll();
    const nowIso = new Date().toISOString();

    const newTask: Task = {
      id: generateTaskId(),
      title: input.title,
      completed: false,
      date: input.date,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    tasks.push(newTask);
    this.writeAll(tasks);

    return newTask;
  }

  async update(id: TaskId, input: UpdateTaskInput): Promise<Task> {
    if (typeof id !== "string" || id.length === 0) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid task id: id must be a non-empty string."
      );
    }

    if (typeof input !== "object" || input === null) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid task update input: patch must be an object."
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(input, "title") &&
      typeof input.title !== "string"
    ) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid patch title: title must be a string if provided."
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(input, "date") &&
      !isValidCalendarDate(input.date)
    ) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid patch date: date must be a valid YYYY-MM-DD calendar date if provided."
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(input, "completed") &&
      typeof input.completed !== "boolean"
    ) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid patch completed: completed must be a boolean if provided."
      );
    }

    const tasks = this.readAll();
    const targetIndex = tasks.findIndex((t) => t.id === id);

    if (targetIndex === -1) {
      throw new LocalTaskRepositoryError(
        "TASK_NOT_FOUND",
        `Task with id "${id}" was not found.`
      );
    }

    const current = tasks[targetIndex];

    const hasTitle =
      Object.prototype.hasOwnProperty.call(input, "title") &&
      input.title !== undefined;
    const hasDate =
      Object.prototype.hasOwnProperty.call(input, "date") &&
      input.date !== undefined;
    const hasCompleted =
      Object.prototype.hasOwnProperty.call(input, "completed") &&
      input.completed !== undefined;

    const isTitleChanged = hasTitle && input.title !== current.title;
    const isDateChanged = hasDate && input.date !== current.date;
    const isCompletedChanged =
      hasCompleted && input.completed !== current.completed;

    if (!isTitleChanged && !isDateChanged && !isCompletedChanged) {
      return current;
    }

    const updatedTask: Task = {
      id: current.id,
      title: hasTitle ? input.title! : current.title,
      date: hasDate ? input.date! : current.date,
      completed: hasCompleted ? input.completed! : current.completed,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };

    tasks[targetIndex] = updatedTask;
    this.writeAll(tasks);

    return updatedTask;
  }

  async delete(id: TaskId): Promise<void> {
    if (typeof id !== "string" || id.length === 0) {
      throw new LocalTaskRepositoryError(
        "INVALID_INPUT",
        "Invalid task id: id must be a non-empty string."
      );
    }

    const tasks = this.readAll();
    const targetIndex = tasks.findIndex((t) => t.id === id);

    if (targetIndex === -1) {
      return;
    }

    tasks.splice(targetIndex, 1);
    this.writeAll(tasks);
  }
}
