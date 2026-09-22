"use client";

import { useState, useTransition, type FormEvent, type ChangeEvent } from "react";
import { Surface } from "@/components/ui/surface";
import { createTodayTask } from "./create-today-task";

interface CreateTaskFormProps {
  onTaskCreated: () => Promise<boolean> | boolean;
}

export function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) {
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);

      const result = await createTodayTask(title);

      if (result.status === "validation_error" || result.status === "error") {
        setErrorMessage(result.message);
        return;
      }

      setTitle("");
      setErrorMessage(null);

      const refreshed = await onTaskCreated();
      if (!refreshed) {
        setErrorMessage("Task was created, but refreshing the list failed. Please refresh.");
      }
    });
  };

  const errorId = "create-task-error";
  const inputId = "new-task-title";

  return (
    <Surface tone="subtle" className="p-3 sm:p-4">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label htmlFor={inputId} className="sr-only">
            New task title
          </label>
          <input
            id={inputId}
            name="title"
            type="text"
            value={title}
            onChange={handleChange}
            placeholder="Add a task for today…"
            disabled={isPending}
            aria-invalid={errorMessage !== null}
            aria-describedby={errorMessage ? errorId : undefined}
            className="flex-1 min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-[40px] sm:min-h-0 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-surface hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isPending ? "Adding…" : "Add task"}
          </button>
        </div>

        {isPending && (
          <p className="sr-only" aria-live="polite">
            Creating task…
          </p>
        )}

        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 dark:text-red-400 break-words mt-0.5"
          >
            {errorMessage}
          </p>
        )}
      </form>
    </Surface>
  );
}
