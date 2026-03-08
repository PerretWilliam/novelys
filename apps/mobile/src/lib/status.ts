import type { LibraryStatus } from "@readingos/shared";

export const statusLabel: Record<LibraryStatus, string> = {
  to_read: "À lire",
  reading: "En cours",
  read: "Lus",
  abandoned: "Abandonnés",
};

export const statusTone: Record<LibraryStatus, string> = {
  to_read: "bg-surface-3 text-text-soft dark:bg-surface-3-dark dark:text-text-dark",
  reading: "bg-warning-soft text-warning dark:bg-warning dark:text-warning-soft",
  read: "bg-success-soft text-success dark:bg-success dark:text-success-soft",
  abandoned: "bg-danger-soft text-danger dark:bg-danger dark:text-danger-soft",
};

export const orderedStatuses: LibraryStatus[] = ["to_read", "reading", "read", "abandoned"];
