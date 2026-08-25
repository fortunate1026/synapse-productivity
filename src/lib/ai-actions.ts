import { aiComplete } from "./ai.functions";
import type { Meeting, Priority, Task } from "./store";

async function run(system: string, prompt: string) {
  const { text } = await aiComplete({ data: { system, prompt } });
  return text.trim();
}

async function runJson<T>(system: string, prompt: string, fallback: T): Promise<T> {
  const { text } = await aiComplete({ data: { system, prompt, json: true } });
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}

const EMAIL_SYSTEM =
  "You are an expert business email writer. Write clear, human, well-structured emails. Never invent facts that were not provided. Return only the email body unless asked otherwise.";

export const emailAI = {
  generate: (instruction: string, tone: string) =>
    run(EMAIL_SYSTEM, `Write an email in a ${tone} tone based on this instruction:\n${instruction}`),
  fromBullets: (bullets: string, tone: string) =>
    run(EMAIL_SYSTEM, `Turn these bullet points into a complete ${tone} email:\n${bullets}`),
  rewrite: (body: string, tone: string) =>
    run(EMAIL_SYSTEM, `Rewrite this email in a ${tone} tone, keeping all facts:\n\n${body}`),
  improve: (body: string) =>
    run(
      EMAIL_SYSTEM,
      `Improve the grammar, spelling, clarity and structure of this email. Keep the tone and meaning:\n\n${body}`,
    ),
  shorten: (body: string) =>
    run(EMAIL_SYSTEM, `Make this email significantly shorter and punchier:\n\n${body}`),
  expand: (body: string) =>
    run(EMAIL_SYSTEM, `Expand this email with more helpful detail and context:\n\n${body}`),
  summarize: (body: string) =>
    run(
      "You summarize emails into crisp bullet points.",
      `Summarize this email in at most 5 bullets:\n\n${body}`,
    ),
  subject: (body: string) =>
    run(
      "You write email subject lines. Reply with the single best subject line only, no quotes.",
      `Write a subject line for this email:\n\n${body}`,
    ),
  reply: (incoming: string, intent: string, tone: string) =>
    run(
      EMAIL_SYSTEM,
      `Write a ${tone} reply to the email below.\nMy intent: ${intent || "reply appropriately"}\n\nEmail received:\n${incoming}`,
    ),
};

export type MeetingAnalysis = {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { title: string; assignee?: string; due?: string; priority?: Priority }[];
  followUps: string[];
};

export async function analyzeMeeting(transcript: string): Promise<MeetingAnalysis> {
  const today = new Date().toISOString().slice(0, 10);
  return runJson<MeetingAnalysis>(
    "You are a meeting analyst. Extract structure from meeting notes and transcripts accurately.",
    `Today is ${today}. Analyze the meeting notes below and return JSON with keys:
title (short meeting title), summary (2-4 sentences), keyPoints (array of strings),
decisions (array of strings), actionItems (array of objects: title, assignee, due as yyyy-mm-dd or empty, priority one of urgent|high|medium|low),
followUps (array of strings).

Meeting notes:
${transcript}`,
    {
      title: "Meeting",
      summary: "",
      keyPoints: [],
      decisions: [],
      actionItems: [],
      followUps: [],
    },
  );
}

export type ParsedTask = {
  title: string;
  priority: Priority;
  dueDate?: string;
  time?: string;
  notes?: string;
  subtasks?: string[];
};

export async function parseTask(text: string): Promise<ParsedTask> {
  const today = new Date().toISOString().slice(0, 10);
  return runJson<ParsedTask>(
    "You turn natural language into structured tasks.",
    `Today is ${today}. Convert this into a task JSON with keys: title, priority (urgent|high|medium|low based on urgency and importance), dueDate (yyyy-mm-dd, suggest a sensible one if none given), time (HH:mm or empty), notes, subtasks (array of short strings, only if the task is large).

Input: ${text}`,
    { title: text, priority: "medium" },
  );
}

export async function breakdownTask(task: Task): Promise<string[]> {
  const res = await runJson<{ subtasks: string[] }>(
    "You break large tasks into concrete actionable subtasks.",
    `Break this task into 3-6 subtasks. Return JSON {"subtasks":["..."]}\n\nTask: ${task.title}\nNotes: ${task.notes ?? ""}`,
    { subtasks: [] },
  );
  return res.subtasks ?? [];
}

export type PlanResult = { plan: string; schedule: { taskId: string; time: string }[] };

export async function planDay(tasks: Task[], workingHours: string): Promise<PlanResult> {
  return runJson<PlanResult>(
    "You are a scheduling assistant that builds realistic day plans.",
    `Working hours: ${workingHours}. Build a focused plan for today from these tasks.
Return JSON: {"plan":"markdown plan text","schedule":[{"taskId":"...","time":"HH:mm"}]}

Tasks:
${tasks.map((t) => `- id=${t.id} | ${t.title} | priority=${t.priority} | due=${t.dueDate ?? "none"}`).join("\n")}`,
    { plan: "", schedule: [] },
  );
}

export function followUpEmailPrompt(meeting: Meeting) {
  return `Write a follow-up email after this meeting.
Title: ${meeting.title}
Summary: ${meeting.summary}
Decisions: ${meeting.decisions.join("; ")}
Action items: ${meeting.actionItems.map((a) => `${a.title}${a.assignee ? ` (${a.assignee})` : ""}${a.due ? ` due ${a.due}` : ""}`).join("; ")}
Follow-ups: ${meeting.followUps.join("; ")}`;
}

export type AssistantResult = {
  reply: string;
  actions?: {
    type: "create_task" | "create_email" | "reschedule_overdue" | "plan_day";
    title?: string;
    priority?: Priority;
    dueDate?: string;
    subject?: string;
    body?: string;
  }[];
};

export async function askAssistant(
  question: string,
  context: { tasks: Task[]; meetings: Meeting[]; emails: { subject: string }[] },
): Promise<AssistantResult> {
  const today = new Date().toISOString().slice(0, 10);
  const ctx = `Today: ${today}
TASKS:
${context.tasks
  .slice(0, 40)
  .map(
    (t) =>
      `- ${t.title} | priority=${t.priority} | due=${t.dueDate ?? "none"} | ${t.completed ? "done" : "open"}`,
  )
  .join("\n")}
MEETINGS:
${context.meetings
  .slice(0, 10)
  .map((m) => `- ${m.title} (${m.date}): ${m.summary ?? ""}`)
  .join("\n")}
EMAIL DRAFTS:
${context.emails
  .slice(0, 10)
  .map((e) => `- ${e.subject}`)
  .join("\n")}`;

  return runJson<AssistantResult>(
    "You are Nexus, an AI productivity assistant with full context of the user's tasks, meetings and emails. You answer helpfully and can propose actions.",
    `${ctx}

User request: ${question}

Return JSON: {"reply":"markdown answer for the user","actions":[{"type":"create_task"|"create_email"|"reschedule_overdue"|"plan_day","title":"","priority":"medium","dueDate":"yyyy-mm-dd","subject":"","body":""}]}
Only include actions the user actually asked for. Use an empty array if none.`,
    { reply: "Sorry, I couldn't process that. Try rephrasing.", actions: [] },
  );
}
