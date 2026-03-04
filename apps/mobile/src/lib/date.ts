const dayMonthYearFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

export const formatPublishedDate = (value?: string): string => {
  if (!value) {
    return "Date inconnue";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "Date inconnue";
  }

  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}-01T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) {
      return monthYearFormatter.format(date);
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) {
      return dayMonthYearFormatter.format(date);
    }
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) {
    return dayMonthYearFormatter.format(fallback);
  }

  return trimmed;
};
