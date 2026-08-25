import { Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/store";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 font-display text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

const priorityStyles: Record<Priority, string> = {
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning-foreground border-warning/40",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-secondary text-secondary-foreground border-border",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("capitalize", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}

export function Markdownish({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (/^#{1,6}\s/.test(trimmed))
          return (
            <p key={i} className="font-display text-base font-semibold">
              {trimmed.replace(/^#{1,6}\s/, "")}
            </p>
          );
        if (/^[-*]\s/.test(trimmed))
          return (
            <p key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{stripBold(trimmed.replace(/^[-*]\s/, ""))}</span>
            </p>
          );
        return <p key={i}>{stripBold(trimmed)}</p>;
      })}
    </div>
  );
}

function stripBold(s: string) {
  return s.replace(/\*\*/g, "");
}
