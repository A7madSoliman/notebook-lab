"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import type { Task } from "@/domain/tasks/task.types";
import { getTodayDate } from "./get-today-date";
import { loadTodayTasks } from "./load-today-tasks";
import { CreateTaskForm } from "./create-task-form";
import { TodayTaskList } from "./today-task-list";
import { updateTaskCompletion } from "./update-task-completion";

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
  const [pendingTaskIds, setPendingTaskIds] = useState<Record<string, boolean>>({});
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});

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

  const handleTaskCompletionChange = useCallback(
    (task: Task, completed: boolean) => {
      if (pendingTaskIds[task.id]) {
        return;
      }

      setPendingTaskIds((current) => ({ ...current, [task.id]: true }));
      setTaskErrors((current) => {
        const next = { ...current };
        delete next[task.id];
        return next;
      });

      updateTaskCompletion(task.id, completed).then((result) => {
        if (result.status === "success") {
          setState((current) => ({
            ...current,
            tasks: current.tasks.map((currentTask) =>
              currentTask.id === result.task.id ? result.task : currentTask
            ),
          }));
        } else {
          setTaskErrors((current) => ({ ...current, [task.id]: result.message }));
        }

        setPendingTaskIds((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });
      });
    },
    [pendingTaskIds]
  );

  return (
    <div className="flex flex-col gap-6">
      <CreateTaskForm onTaskCreated={loadTasks} />

      <TodayTaskList
        tasks={state.tasks}
        status={isPending && state.status === "loading" ? "loading" : state.status}
        errorMessage={state.status === "error" ? state.message : undefined}
        onRetry={loadTasks}
        pendingTaskIds={pendingTaskIds}
        taskErrors={taskErrors}
        onTaskCompletionChange={handleTaskCompletionChange}
      />
    </div>
  );
}
