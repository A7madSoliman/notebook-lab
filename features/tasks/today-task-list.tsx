import { Surface } from "@/components/ui/surface";
import type { Task } from "@/domain/tasks/task.types";

interface TodayTaskListProps {
  tasks: Task[];
  status: "loading" | "success" | "error";
  errorMessage?: string;
  onRetry?: () => void;
  pendingTaskIds?: Record<string, boolean>;
  taskErrors?: Record<string, string>;
  onTaskCompletionChange?: (task: Task, completed: boolean) => void;
}

export function TodayTaskList({
  tasks,
  status,
  errorMessage,
  onRetry,
  pendingTaskIds = {},
  taskErrors = {},
  onTaskCompletionChange,
}: TodayTaskListProps) {
  if (status === "loading") {
    return (
      <Surface className="p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div
          className="flex flex-col items-center gap-3"
          aria-busy="true"
          aria-live="polite"
        >
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted">Loading today&apos;s tasks…</p>
        </div>
      </Surface>
    );
  }

  if (status === "error") {
    return (
      <Surface className="p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="max-w-sm flex flex-col items-center gap-3" role="alert">
          <h2 className="text-base font-medium text-foreground">
            Error loading tasks
          </h2>
          <p className="text-sm text-muted break-words">
            {errorMessage || "Unable to load tasks for today. Please try again."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </Surface>
    );
  }

  if (tasks.length === 0) {
    return (
      <Surface className="p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="max-w-sm flex flex-col items-center gap-2">
          <h2 className="text-base font-medium text-foreground">
            No tasks for today
          </h2>
          <p className="text-sm text-muted">
            Your workspace is clear. Tasks created for today will appear here.
          </p>
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="overflow-hidden">
      <ul
        aria-label="Today's tasks"
        className="divide-y divide-border-subtle"
      >
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 p-4 sm:px-6 hover:bg-surface-subtle/50 transition-colors"
          >
            <label className="mt-0.5 flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(event) =>
                  onTaskCompletionChange?.(task, event.target.checked)
                }
                disabled={pendingTaskIds[task.id]}
                aria-label={`${task.completed ? "Reopen" : "Complete"} task: ${task.title}`}
                className="h-4 w-4 cursor-pointer accent-accent disabled:cursor-wait disabled:opacity-50"
              />
            </label>
            <div className="flex-1 min-w-0">
              <span
                className={`block text-sm break-words leading-relaxed ${
                  task.completed
                    ? "text-muted line-through"
                    : "text-foreground font-normal"
                }`}
              >
                {task.title}
              </span>
              <span className="sr-only">
                {task.completed ? "Status: Completed" : "Status: Incomplete"}
              </span>
              {pendingTaskIds[task.id] && (
                <span className="block text-xs text-muted" aria-live="polite">
                  Updating task…
                </span>
              )}
              {taskErrors[task.id] && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className="block text-xs text-red-600 dark:text-red-400 break-words"
                    role="alert"
                  >
                    {taskErrors[task.id]}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTaskCompletionChange?.(task, !task.completed)}
                    disabled={pendingTaskIds[task.id]}
                    className="text-xs font-medium text-accent underline underline-offset-2 disabled:opacity-50"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
