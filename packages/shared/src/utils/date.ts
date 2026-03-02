export const nowIso = (): string => new Date().toISOString();

export const isDateString = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
};
