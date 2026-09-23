import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Surface } from "@/components/ui/surface";
import type { Task, TaskDate } from "@/domain/tasks/task.types";

interface TodayTaskListProps {
  tasks: Task[];
  status: "loading" | "success" | "error";
  errorMessage?: string;
  onRetry?: () => void;
  pendingTaskIds?: Record<string, boolean>;
  taskErrors?: Record<string, string>;
  onTaskCompletionChange?: (task: Task, completed: boolean) => void;
  onEditTask?: (
    task: Task,
    updates: { rawTitle: string; date: TaskDate }
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteTask?: (task: Task) => Promise<{ success: boolean; error?: string }>;
}

export function TodayTaskList({
  tasks,
  status,
  errorMessage,
  onRetry,
  pendingTaskIds = {},
  taskErrors = {},
  onTaskCompletionChange,
  onEditTask,
  onDeleteTask,
}: TodayTaskListProps) {
  // Editing state tracked per task ID: keeps draft title and date while editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocalError, setEditLocalError] = useState<string | null>(null);

  // Deletion confirmation tracked per task ID
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);

  // Focus ref for inline edit title input
  const editTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTaskId && editTitleInputRef.current) {
      editTitleInputRef.current.focus();
    }
  }, [editingTaskId]);

  const handleStartEdit = (task: Task) => {
    // If another task is in confirmation or editing, switch cleanly
    setConfirmDeleteTaskId(null);
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDate(task.date);
    setEditLocalError(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDate("");
    setEditLocalError(null);
  };

  const handleSaveEdit = async (e: FormEvent, task: Task) => {
    e.preventDefault();
    if (!onEditTask || pendingTaskIds[task.id]) {
      return;
    }

    setEditLocalError(null);

    const result = await onEditTask(task, {
      rawTitle: editTitle,
      date: editDate,
    });

    if (result.success) {
      setEditingTaskId(null);
      setEditTitle("");
      setEditDate("");
      setEditLocalError(null);
    } else if (result.error) {
      setEditLocalError(result.error);
    }
  };

  const handleArmDelete = (task: Task) => {
    if (editingTaskId === task.id) {
      handleCancelEdit();
    }
    setConfirmDeleteTaskId(task.id);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteTaskId(null);
  };

  const handleConfirmDelete = async (task: Task) => {
    if (!onDeleteTask || pendingTaskIds[task.id]) {
      return;
    }

    const result = await onDeleteTask(task);
    if (result.success) {
      setConfirmDeleteTaskId(null);
    }
  };

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
        {tasks.map((task) => {
          const isPending = !!pendingTaskIds[task.id];
          const isEditing = editingTaskId === task.id;
          const isConfirmingDelete = confirmDeleteTaskId === task.id;
          const taskError = taskErrors[task.id];
          const editErrorId = `edit-error-${task.id}`;

          return (
            <li
              key={task.id}
              className="flex items-start gap-3 p-4 sm:px-6 hover:bg-surface-subtle/50 transition-colors"
            >
              {/* Completion checkbox: disabled when pending or editing */}
              <label className="mt-0.5 flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-md focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(event) =>
                    onTaskCompletionChange?.(task, event.target.checked)
                  }
                  disabled={isPending || isEditing}
                  aria-label={`${task.completed ? "Reopen" : "Complete"} task: ${task.title}`}
                  className="h-4 w-4 cursor-pointer accent-accent disabled:cursor-wait disabled:opacity-50"
                />
              </label>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveEdit(e, task)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelEdit();
                      }
                    }}
                    noValidate
                    className="flex flex-col gap-2.5 py-1"
                  >
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor={`edit-title-${task.id}`}
                        className="text-xs font-medium text-muted"
                      >
                        Title
                      </label>
                      <input
                        ref={editTitleInputRef}
                        id={`edit-title-${task.id}`}
                        name="title"
                        type="text"
                        value={editTitle}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setEditTitle(e.target.value);
                          if (editLocalError) setEditLocalError(null);
                        }}
                        disabled={isPending}
                        placeholder="Task title"
                        aria-invalid={editLocalError !== null}
                        aria-describedby={editLocalError ? editErrorId : undefined}
                        className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor={`edit-date-${task.id}`}
                        className="text-xs font-medium text-muted"
                      >
                        Date (YYYY-MM-DD)
                      </label>
                      <input
                        id={`edit-date-${task.id}`}
                        name="date"
                        type="date"
                        value={editDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setEditDate(e.target.value);
                          if (editLocalError) setEditLocalError(null);
                        }}
                        disabled={isPending}
                        aria-invalid={editLocalError !== null}
                        aria-describedby={editLocalError ? editErrorId : undefined}
                        className="w-full sm:w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 transition-colors"
                      />
                    </div>

                    {isPending && (
                      <span className="block text-xs text-muted" aria-live="polite">
                        Saving changes…
                      </span>
                    )}

                    {editLocalError && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span
                          id={editErrorId}
                          className="block text-xs text-red-600 dark:text-red-400 break-words"
                          role="alert"
                        >
                          {editLocalError}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-surface hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
                      >
                        {isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
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
                          {task.completed
                            ? "Status: Completed"
                            : "Status: Incomplete"}
                        </span>
                      </div>

                      {/* Task actions: Edit / Delete or Delete Confirmation */}
                      <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-start">
                        {isConfirmingDelete ? (
                          <div
                            className="flex items-center gap-1.5 rounded-md border border-border bg-surface p-1 shadow-xs"
                            role="group"
                            aria-label={`Confirm deletion of task: ${task.title}`}
                          >
                            <span className="text-xs text-foreground px-1 font-medium">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelete(task)}
                              disabled={isPending}
                              className="inline-flex items-center justify-center rounded bg-red-600 dark:bg-red-700 px-2 py-1 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 cursor-pointer transition-all"
                            >
                              {isPending ? "Deleting…" : "Confirm"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              disabled={isPending}
                              className="inline-flex items-center justify-center rounded border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(task)}
                              disabled={isPending}
                              aria-label={`Edit task: ${task.title}`}
                              className="inline-flex items-center justify-center rounded border border-transparent px-2 py-1 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArmDelete(task)}
                              disabled={isPending}
                              aria-label={`Delete task: ${task.title}`}
                              className="inline-flex items-center justify-center rounded border border-transparent px-2 py-1 text-xs font-medium text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <span className="block text-xs text-muted mt-1" aria-live="polite">
                        Updating task…
                      </span>
                    )}

                    {taskError && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className="block text-xs text-red-600 dark:text-red-400 break-words"
                          role="alert"
                        >
                          {taskError}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isConfirmingDelete) {
                              handleConfirmDelete(task);
                            } else {
                              onTaskCompletionChange?.(task, !task.completed);
                            }
                          }}
                          disabled={isPending}
                          className="text-xs font-medium text-accent underline underline-offset-2 disabled:opacity-50 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
