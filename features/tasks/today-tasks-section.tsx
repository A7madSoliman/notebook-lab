"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import type { Task } from "@/domain/tasks/task.types";
import { getTodayDate } from "./get-today-date";
import { loadTodayTasks } from "./load-today-tasks";
import { CreateTaskForm } from "./create-task-form";
import { TodayTaskList } from "./today-task-list";

type ViewState =
  | { status: "loading"; tasks: Task[] }
  | { status: "success"; tasks: Task[] }
  | { status: "error"; tasks: Task[]; message: string };

export function TodayTasksSection() {
  const [state, setState] = useState<ViewState>({
    status: "loading",
    tasks: [],
  });
  const [isPending, startTransition] = useTransition();

  const loadTasks = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(() => {
        const today = getTodayDate();
        loadTodayTasks(today).then((result) => {
          if (result.status === "success") {
            setState({ status: "success", tasks: result.tasks });
            resolve(true);
          } else {
            setState((prev) => ({
              status: "error",
              tasks: prev.tasks,
              message: result.message,
            }));
            resolve(false);
          }
        });
      });
    });
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="flex flex-col gap-6">
      <CreateTaskForm onTaskCreated={loadTasks} />

      <TodayTaskList
        tasks={state.tasks}
        status={isPending && state.status === "loading" ? "loading" : state.status}
        errorMessage={state.status === "error" ? state.message : undefined}
        onRetry={loadTasks}
      />
    </div>
  );
}
