# Aura Productivity

Build a modern, all-in-one AI Productivity Suite that combines three powerful tools into one seamless application:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner & Scheduler

Important: Do NOT include authentication.
Do not create login, signup, password, user accounts, OAuth authentication, account verification, or authentication screens. The application should open directly to the main dashboard and be usable immediately.

1. Smart Email Generator

Create an AI-powered email assistant that allows users to:

Generate professional emails from simple instructions.

Rewrite emails in different tones:

Professional

Friendly

Formal

Casual

Persuasive

Concise

Improve grammar, spelling, clarity, and structure.

Generate email subject lines.

Summarize long emails.

Turn bullet points into complete emails.

Generate replies from provided email content.

Shorten or expand emails.

Copy and edit generated emails.

Save drafts locally.

Include buttons such as:

Generate | Rewrite | Improve | Shorten | Expand | Change Tone | Copy

2. Meeting Notes Summarizer

Create an AI meeting assistant where users can paste or upload meeting notes/transcripts.

The AI should automatically generate:

Meeting summary

Key discussion points

Important decisions

Action items

Assigned tasks

Deadlines

Follow-up items

Allow users to edit, copy, save, and export meeting summaries.

3. AI Task Planner & Scheduler

Create an intelligent task management system that can:

Create tasks using natural language.

Convert meeting action items into tasks automatically.

Prioritize tasks based on urgency and importance.

Suggest deadlines.

Break large tasks into subtasks.

Create daily, weekly, and monthly plans.

Schedule tasks.

Detect overdue tasks.

Reschedule unfinished tasks.

Add reminders.

Mark tasks as completed.

Edit, delete, and reprioritize tasks.

Include:

Today | Upcoming | Overdue | Completed | Calendar

4. Connect Everything Together

The most important requirement is that all three tools work together as one intelligent AI productivity assistant.

Create this workflow:

Meeting → Summary → Action Items → Tasks → Schedule → Email

Example:

A user pastes a meeting transcript.

The AI:

Summarizes the meeting.

Extracts action items.

Converts action items into tasks.

Assigns priorities.

Suggests deadlines.

Adds tasks to the schedule.

Generates a follow-up email.

Allows the user to review and copy the email.

The user should be able to move between these functions without leaving the application.

5. Central AI Assistant

Add a central "Ask AI" assistant.

Users should be able to type commands such as:

"Summarize this meeting and create tasks from the action items."

"Create a professional follow-up email based on this meeting."

"Plan my day using my highest-priority tasks."

"Move unfinished tasks to tomorrow."

"Write an email reminding John about his overdue task."

The AI should understand the context of the user's meetings, emails, tasks, and schedule.

6. Dashboard

Create a beautiful dashboard containing:

Welcome message

Today's priorities

Upcoming tasks

Overdue tasks

Recent meetings

Recent emails

Calendar

Productivity statistics

AI recommendations

Quick-action buttons

Quick actions:

Generate Email
Summarize Meeting
Create Task
Plan My Day
Ask AI

7. Navigation

Use a simple sidebar:

Dashboard
AI Assistant
Emails
Meetings
Tasks
Calendar
Analytics
Settings

Do not include:

Login

Signup

Authentication

User accounts

OAuth

Password reset

Account verification

8. Data Storage

Since there is no authentication, use local storage or another simple local data solution for saving:

Tasks

Meeting notes

Email drafts

Preferences

Calendar items

AI-generated content

Make it possible for the user to clear their local data from Settings.

9. UI/UX

Create a polished modern SaaS-style interface with:

Responsive design

Desktop and mobile support

Light/dark mode

Clean cards

Modern typography

Sidebar navigation

Search

Smooth animations

Loading states

Empty states

Error handling

Toast notifications

Drag-and-drop task scheduling

The interface should feel like a premium AI productivity application.

10. Technical Requirements

Build the application using a modular architecture with:

Frontend

AI service layer

Task management system

Meeting processing system

Email generation system

Calendar/scheduling system

Local data storage

Keep the architecture clean and scalable so more AI features can be added later.

11. Final Product Goal

The final application should feel like one AI personal productivity assistant, not three separate tools.

The core experience should be:

Capture → Understand → Plan → Schedule → Communicate → Complete

Start the application directly on the dashboard with no authentication or login screen whatsoever.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://synapse-productivity.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d6b66e2-280b-4d2c-810a-9043e9b17859).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
