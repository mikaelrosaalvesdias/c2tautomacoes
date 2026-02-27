import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "neutral" | "success" | "warning" | "danger";
  className?: string;
};

const toneClass: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-secondary text-foreground border-border",
  neutral: "bg-secondary text-muted-foreground border-border",
  success: "bg-neon/15 text-neon border-neon/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30"
};

export function StatusBadge({ label, tone = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
