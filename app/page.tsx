import { Surface } from "@/components/ui/surface";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Notebook Lab
            </span>
          </div>
          <span className="text-xs font-medium text-muted">
            Workspace Shell
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-8">
        <section aria-labelledby="today-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-border-subtle pb-3">
            <h1 id="today-heading" className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Today
            </h1>
            <p className="text-sm text-muted">
              Focus on today&apos;s priorities and ongoing items.
            </p>
          </div>

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
        </section>

        <section aria-labelledby="context-heading">
          <Surface tone="subtle" className="p-4 sm:p-5">
            <h2 id="context-heading" className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              About Notebook Lab
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              A quiet personal productivity notebook designed for focused daily planning, intentional tracking, and steady progress.
            </p>
          </Surface>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-surface py-4 mt-auto">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 sm:px-6 text-xs text-muted">
          <span>Notebook Lab</span>
          <span>Task-first workspace</span>
        </div>
      </footer>
    </div>
  );
}
