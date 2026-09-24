"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import type { Task, TaskDate } from "@/domain/tasks/task.types";
import { getTodayDate } from "./get-today-date";
import { loadTodayTasks } from "./load-today-tasks";
import { CreateTaskForm } from "./create-task-form";
import { TodayTaskList } from "./today-task-list";
import { updateTaskCompletion } from "./update-task-completion";
import { updateTaskDetails } from "./update-task-details";
import { deleteTask } from "./delete-task";
import { calculateTaskStatistics } from "@/domain/tasks/task-statistics";
import { DailySummary } from "./daily-summary";

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

  const handleEditTask = useCallback(
    async (
      task: Task,
      updates: { rawTitle: string; date: TaskDate }
    ): Promise<{ success: boolean; error?: string }> => {
      if (pendingTaskIds[task.id]) {
        return { success: false };
      }

      setPendingTaskIds((current) => ({ ...current, [task.id]: true }));
      // Clear any prior row-level errors for this task
      setTaskErrors((current) => {
        const next = { ...current };
        delete next[task.id];
        return next;
      });

      const result = await updateTaskDetails(task.id, updates);

      if (result.status === "success") {
        const freshToday = getTodayDate();
        setState((current) => {
          if (result.task.date === freshToday) {
            return {
              ...current,
              tasks: current.tasks.map((t) => (t.id === result.task.id ? result.task : t)),
            };
          } else {
            // Task date changed away from today, remove without page refresh
            return {
              ...current,
              tasks: current.tasks.filter((t) => t.id !== result.task.id),
            };
          }
        });

        setPendingTaskIds((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });

        return { success: true };
      } else {
        const errorMessage = result.message;
        // Do NOT populate row-level taskErrors so non-edit completion retry is never triggered by edit failure.
        // Return errorMessage so the edit draft maintains it locally.
        setPendingTaskIds((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });

        return { success: false, error: errorMessage };
      }
    },
    [pendingTaskIds]
  );

  const handleDeleteTask = useCallback(
    async (task: Task): Promise<{ success: boolean; error?: string }> => {
      if (pendingTaskIds[task.id]) {
        return { success: false };
      }

      setPendingTaskIds((current) => ({ ...current, [task.id]: true }));
      setTaskErrors((current) => {
        const next = { ...current };
        delete next[task.id];
        return next;
      });

      const result = await deleteTask(task.id);

      if (result.status === "success") {
        // Successful delete: remove row from visible list
        setState((current) => ({
          ...current,
          tasks: current.tasks.filter((t) => t.id !== task.id),
        }));

        setPendingTaskIds((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });

        return { success: true };
      } else {
        const errorMessage = result.message;
        setTaskErrors((current) => ({ ...current, [task.id]: errorMessage }));

        setPendingTaskIds((current) => {
          const next = { ...current };
          delete next[task.id];
          return next;
        });

        return { success: false, error: errorMessage };
      }
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
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      {state.status === "success" && (
        <DailySummary statistics={calculateTaskStatistics(state.tasks)} />
      )}
    </div>
  );
}
