import { cn } from "@/lib/utils";

type Tone = "default" | "neutral" | "success" | "warning" | "danger" | "purple";

type StatusBadgeProps = {
  label: string;
  tone?: Tone;
  className?: string;
};

/** Determine color based on company name */
function companyTone(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("c2") || l.includes("c2tech")) return "bg-neon/15 text-neon border-neon/30";
  if (l.includes("inka") || l.includes("acme")) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (l.includes("california") || l.includes("globex")) return "bg-violet/15 text-violet border-violet/30";
  // Hash-based color for unknown companies
  const hash = [...label].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    "bg-neon/15 text-neon border-neon/30",
    "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "bg-violet/15 text-violet border-violet/30",
    "bg-sky-500/15 text-sky-400 border-sky-500/30",
    "bg-rose-500/15 text-rose-400 border-rose-500/30"
  ];
  return colors[hash % colors.length];
}

/** Determine color based on action/etiqueta label */
function actionTone(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("cancel")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (l.includes("renov") || l.includes("resolv") || l.includes("boas-vindas") || l.includes("boas_vindas")) return "bg-neon/15 text-neon border-neon/30";
  if (l.includes("atualiz") || l.includes("follow") || l.includes("proposta")) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (l.includes("cobran") || l.includes("urgente")) return "bg-violet/15 text-violet border-violet/30";
  if (l.includes("suporte") || l.includes("comercial")) return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  return "bg-secondary text-foreground/80 border-border";
}

const toneClass: Record<Tone, string> = {
  default:  "bg-secondary text-foreground/80 border-border",
  neutral:  "bg-secondary text-muted-foreground border-border",
  success:  "bg-neon/15 text-neon border-neon/30",
  warning:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  danger:   "bg-red-500/15 text-red-400 border-red-500/30",
  purple:   "bg-violet/15 text-violet border-violet/30"
};

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  const cls = tone ? toneClass[tone] : actionTone(label);
  return (
    <span
      className={cn("inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", cls, className)}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export function CompanyBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", companyTone(label), className)}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
