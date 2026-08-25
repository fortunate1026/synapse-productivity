import { useSyncExternalStore } from "react";

export type Priority = "urgent" | "high" | "medium" | "low";

export type Subtask = { id: string; title: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string; // yyyy-mm-dd
  time?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  reminder?: string;
  subtasks: Subtask[];
  sourceMeetingId?: string;
  assignee?: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  transcript: string;
  summary?: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { title: string; assignee?: string; due?: string; priority?: Priority }[];
  followUps: string[];
  createdAt: string;
};

export type EmailDraft = {
  id: string;
  subject: string;
  body: string;
  tone?: string;
  createdAt: string;
  updatedAt: string;
  sourceMeetingId?: string;
};

export type Preferences = {
  theme: "light" | "dark";
  name: string;
  defaultTone: string;
  workingHours: string;
};

export type AppData = {
  tasks: Task[];
  meetings: Meeting[];
  emails: EmailDraft[];
  prefs: Preferences;
};

const KEY = "nexus-ai-suite-v1";

export const defaultData: AppData = {
  tasks: [],
  meetings: [],
  emails: [],
  prefs: { theme: "light", name: "there", defaultTone: "Professional", workingHours: "09:00-17:00" },
};

let state: AppData = defaultData;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>;
      state = {
        ...defaultData,
        ...parsed,
        prefs: { ...defaultData.prefs, ...(parsed.prefs ?? {}) },
      };
    }
  } catch {
    state = defaultData;
  }
  applyTheme(state.prefs.theme);
  emit();
}

export function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setState(updater: (prev: AppData) => AppData) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverSnapshot = () => defaultData;

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, () => state, serverSnapshot);
}

export function getData() {
  return state;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const nowISO = () => new Date().toISOString();
export const todayStr = () => new Date().toISOString().slice(0, 10);

/* ---------- Tasks ---------- */

export function addTask(input: Partial<Task> & { title: string }): Task {
  const task: Task = {
    id: uid(),
    title: input.title,
    notes: input.notes,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate,
    time: input.time,
    completed: false,
    createdAt: nowISO(),
    reminder: input.reminder,
    subtasks: input.subtasks ?? [],
    sourceMeetingId: input.sourceMeetingId,
    assignee: input.assignee,
  };
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
  return task;
}

export function updateTask(id: string, patch: Partial<Task>) {
  setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
}

export function toggleTask(id: string) {
  setState((s) => ({
    ...s,
    tasks: s.tasks.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? nowISO() : undefined }
        : t,
    ),
  }));
}

export function deleteTask(id: string) {
  setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
}

/* ---------- Meetings ---------- */

export function addMeeting(m: Omit<Meeting, "id" | "createdAt">): Meeting {
  const meeting: Meeting = { ...m, id: uid(), createdAt: nowISO() };
  setState((s) => ({ ...s, meetings: [meeting, ...s.meetings] }));
  return meeting;
}

export function updateMeeting(id: string, patch: Partial<Meeting>) {
  setState((s) => ({
    ...s,
    meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }));
}

export function deleteMeeting(id: string) {
  setState((s) => ({ ...s, meetings: s.meetings.filter((m) => m.id !== id) }));
}

/* ---------- Emails ---------- */

export function addEmail(e: Partial<EmailDraft> & { body: string }): EmailDraft {
  const draft: EmailDraft = {
    id: uid(),
    subject: e.subject ?? "(no subject)",
    body: e.body,
    tone: e.tone,
    sourceMeetingId: e.sourceMeetingId,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  setState((s) => ({ ...s, emails: [draft, ...s.emails] }));
  return draft;
}

export function updateEmail(id: string, patch: Partial<EmailDraft>) {
  setState((s) => ({
    ...s,
    emails: s.emails.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: nowISO() } : e)),
  }));
}

export function deleteEmail(id: string) {
  setState((s) => ({ ...s, emails: s.emails.filter((e) => e.id !== id) }));
}

/* ---------- Preferences ---------- */

export function setPrefs(patch: Partial<Preferences>) {
  setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  if (patch.theme) applyTheme(patch.theme);
}

export function clearAllData() {
  state = { ...defaultData, prefs: getData().prefs };
  persist();
  emit();
}

export function exportData() {
  return JSON.stringify(state, null, 2);
}

/* ---------- Derived helpers ---------- */

export const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function isOverdue(t: Task) {
  return !t.completed && !!t.dueDate && t.dueDate < todayStr();
}

export function isToday(t: Task) {
  return !t.completed && t.dueDate === todayStr();
}

export function isUpcoming(t: Task) {
  return !t.completed && !!t.dueDate && t.dueDate > todayStr();
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
  );
}
