import { Surface } from "@/components/ui/surface";
import type { TaskStatistics } from "@/domain/tasks/task-statistics";

interface DailySummaryProps {
  statistics: TaskStatistics;
}

export function DailySummary({ statistics }: DailySummaryProps) {
  const { total, completed, incomplete, completionPercentage } = statistics;

  const formattedPercentage = `${Math.round(completionPercentage)}%`;

  return (
    <Surface tone="subtle" className="p-3 sm:p-4">
      <section aria-labelledby="daily-summary-heading" className="flex flex-col gap-2">
        <h2
          id="daily-summary-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Daily Summary
        </h2>

        <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-xs sm:text-sm">
          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Total:</dt>
            <dd className="font-medium text-foreground">{total}</dd>
          </div>

          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Completed:</dt>
            <dd className="font-medium text-foreground">{completed}</dd>
          </div>

          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Incomplete:</dt>
            <dd className="font-medium text-foreground">{incomplete}</dd>
          </div>

          <div className="flex items-baseline gap-1.5">
            <dt className="text-muted">Completion rate:</dt>
            <dd className="font-medium text-foreground">{formattedPercentage}</dd>
          </div>
        </dl>
      </section>
    </Surface>
  );
}
