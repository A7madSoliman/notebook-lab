import { Surface } from "@/components/ui/surface";
import type { Task } from "@/domain/tasks/task.types";

interface TodayTaskListProps {
  tasks: Task[];
  status: "loading" | "success" | "error";
  errorMessage?: string;
  onRetry?: () => void;
}

export function TodayTaskList({
  tasks,
  status,
  errorMessage,
  onRetry,
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
            <span
              className={`mt-1 inline-flex h-3.5 w-3.5 shrink-0 rounded-full border ${
                task.completed
                  ? "border-muted bg-muted"
                  : "border-border bg-transparent"
              }`}
              aria-hidden="true"
            />
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
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
