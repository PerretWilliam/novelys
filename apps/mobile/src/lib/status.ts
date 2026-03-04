import type { LibraryStatus } from "@readingos/shared";

export const statusLabel: Record<LibraryStatus, string> = {
  to_read: "À lire",
  reading: "En cours",
  read: "Lus",
  abandoned: "Abandonnés",
};

export const statusTone: Record<LibraryStatus, string> = {
  to_read: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  reading: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  read: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  abandoned: "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

export const orderedStatuses: LibraryStatus[] = ["to_read", "reading", "read", "abandoned"];
