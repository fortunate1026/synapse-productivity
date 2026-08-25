import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  NotebookPen,
  ListChecks,
  Sparkles,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState, Loading, Markdownish, PriorityBadge } from "@/components/shared";
import {
  isOverdue,
  isToday,
  isUpcoming,
  sortTasks,
  toggleTask,
  todayStr,
  updateTask,
  useAppData,
} from "@/lib/store";
import { planDay } from "@/lib/ai-actions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexus AI Productivity Suite" },
      {
        name: "description",
        content:
          "Your daily command center: today's priorities, overdue work, recent meetings, email drafts and AI recommendations.",
      },
      { property: "og:title", content: "Dashboard — Nexus AI Productivity Suite" },
      {
        property: "og:description",
        content: "Today's priorities, overdue tasks, recent meetings and AI recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { to: "/emails", label: "Generate Email", icon: Mail },
  { to: "/meetings", label: "Summarize Meeting", icon: NotebookPen },
  { to: "/tasks", label: "Create Task", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/assistant", label: "Ask AI", icon: Sparkles },
] as const;

function Dashboard() {
  const data = useAppData();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("");
  const [planning, setPlanning] = useState(false);

  const today = useMemo(() => sortTasks(data.tasks.filter(isToday)), [data.tasks]);
  const overdue = useMemo(() => sortTasks(data.tasks.filter(isOverdue)), [data.tasks]);
  const upcoming = useMemo(() => sortTasks(data.tasks.filter(isUpcoming)).slice(0, 5), [data.tasks]);
  const done = data.tasks.filter((t) => t.completed);
  const completion = data.tasks.length
    ? Math.round((done.length / data.tasks.length) * 100)
    : 0;

  const handlePlanDay = async () => {
    const open = data.tasks.filter((t) => !t.completed);
    if (!open.length) {
      toast.error("Add some tasks first so I can plan your day.");
      return;
    }
    setPlanning(true);
    try {
      const res = await planDay(open, data.prefs.workingHours);
      setPlan(res.plan);
      res.schedule?.forEach((s) => {
        if (open.some((t) => t.id === s.taskId))
          updateTask(s.taskId, { time: s.time, dueDate: todayStr() });
      });
      toast.success("Day planned and scheduled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not plan your day");
    } finally {
      setPlanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="mesh-hero animate-rise rounded-2xl border border-border p-6 md:p-8">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
          Good {greeting()}, {data.prefs.name}.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Capture → Understand → Plan → Schedule → Communicate → Complete. Paste a meeting and Nexus
          handles the rest.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Button key={q.to} variant="secondary" size="sm" asChild>
              <Link to={q.to}>
                <q.icon className="size-4" />
                {q.label}
              </Link>
            </Button>
          ))}
          <Button size="sm" onClick={handlePlanDay} disabled={planning}>
            <Sparkles className="size-4" /> Plan My Day
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open tasks" value={data.tasks.filter((t) => !t.completed).length} />
        <Stat label="Due today" value={today.length} />
        <Stat label="Overdue" value={overdue.length} tone="destructive" />
        <Stat label="Completed" value={done.length} tone="success" />
      </div>

      {(planning || plan) && (
        <Card className="animate-rise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> AI plan for today
            </CardTitle>
          </CardHeader>
          <CardContent>{planning ? <Loading label="Building your plan…" /> : <Markdownish text={plan} />}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's priorities</CardTitle>
            <CardDescription>Ordered by urgency and importance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {today.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Nothing scheduled today"
                description="Create a task or let the AI plan your day."
                action={
                  <Button size="sm" onClick={() => navigate({ to: "/tasks" })}>
                    Create task
                  </Button>
                }
              />
            ) : (
              today.map((t) => (
                <TaskRow key={t.id} title={t.title} priority={t.priority} time={t.time} onToggle={() => toggleTask(t.id)} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" /> Overdue
            </CardTitle>
            <CardDescription>Reschedule or complete these first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing overdue. Nice work.
              </p>
            ) : (
              overdue.map((t) => (
                <TaskRow
                  key={t.id}
                  title={t.title}
                  priority={t.priority}
                  time={t.dueDate}
                  onToggle={() => toggleTask(t.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No upcoming tasks.</p>
            ) : (
              upcoming.map((t) => (
                <TaskRow key={t.id} title={t.title} priority={t.priority} time={t.dueDate} onToggle={() => toggleTask(t.id)} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" /> Productivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion rate</span>
                <span className="font-medium">{completion}%</span>
              </div>
              <Progress value={completion} className="mt-2" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <MiniStat label="Meetings" value={data.meetings.length} />
              <MiniStat label="Drafts" value={data.emails.length} />
              <MiniStat label="Subtasks" value={data.tasks.reduce((n, t) => n + t.subtasks.length, 0)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.meetings.length === 0 ? (
              <EmptyState
                icon={NotebookPen}
                title="No meetings yet"
                description="Paste a transcript and Nexus extracts summary, decisions and action items."
                action={
                  <Button size="sm" onClick={() => navigate({ to: "/meetings" })}>
                    Summarize meeting
                  </Button>
                }
              />
            ) : (
              data.meetings.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  to="/meetings"
                  className="block rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{m.summary}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent email drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.emails.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="No drafts yet"
                description="Generate a professional email from a one-line instruction."
                action={
                  <Button size="sm" onClick={() => navigate({ to: "/emails" })}>
                    Generate email
                  </Button>
                }
              />
            ) : (
              data.emails.slice(0, 4).map((e) => (
                <Link
                  key={e.id}
                  to="/emails"
                  className="block rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <p className="text-sm font-medium">{e.subject}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{e.body}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "destructive" | "success";
}) {
  return (
    <Card className="animate-rise">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={
            "mt-1 font-display text-3xl font-semibold " +
            (tone === "destructive" ? "text-destructive" : tone === "success" ? "text-success" : "")
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <p className="font-display text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TaskRow({
  title,
  priority,
  time,
  onToggle,
}: {
  title: string;
  priority: "urgent" | "high" | "medium" | "low";
  time?: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <button onClick={onToggle} aria-label="Complete task" className="text-muted-foreground hover:text-success">
        <CheckCircle2 className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {time && <p className="text-xs text-muted-foreground">{time}</p>}
      </div>
      <PriorityBadge priority={priority} />
    </div>
  );
}
