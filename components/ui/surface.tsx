import type { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  tone?: "default" | "subtle";
  className?: string;
}

export function Surface({
  children,
  tone = "default",
  className,
}: SurfaceProps) {
  const toneClasses =
    tone === "subtle"
      ? "border-border-subtle bg-surface-subtle"
      : "border-border bg-surface";

  const baseClasses = `rounded-lg border ${toneClasses}`;
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return <div className={combinedClasses}>{children}</div>;
}
