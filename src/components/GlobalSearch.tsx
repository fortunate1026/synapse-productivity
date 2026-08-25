import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppData } from "@/lib/store";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const data = useAppData();
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search tasks, meetings, emails…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/assistant")}>Ask AI</CommandItem>
          <CommandItem onSelect={() => go("/emails")}>Generate email</CommandItem>
          <CommandItem onSelect={() => go("/meetings")}>Summarize meeting</CommandItem>
          <CommandItem onSelect={() => go("/tasks")}>Create task</CommandItem>
        </CommandGroup>
        {data.tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {data.tasks.slice(0, 6).map((t) => (
              <CommandItem key={t.id} value={`task ${t.title}`} onSelect={() => go("/tasks")}>
                {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {data.meetings.length > 0 && (
          <CommandGroup heading="Meetings">
            {data.meetings.slice(0, 6).map((m) => (
              <CommandItem key={m.id} value={`meeting ${m.title}`} onSelect={() => go("/meetings")}>
                {m.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {data.emails.length > 0 && (
          <CommandGroup heading="Email drafts">
            {data.emails.slice(0, 6).map((e) => (
              <CommandItem key={e.id} value={`email ${e.subject}`} onSelect={() => go("/emails")}>
                {e.subject}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
