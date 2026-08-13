export const formatOrderDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const toDateInputValue = (value) => {
  if (!value) return '';

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 10);
};

export const addMonthsToDateInput = (dateStr, months) => {
  if (!dateStr || months == null) return '';

  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return '';

  const date = new Date(year, month - 1, day);
  const originalDay = date.getDate();
  date.setMonth(date.getMonth() + months);

  // Clamp overflow (e.g. Jan 31 + 1 month → last day of Feb)
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const computeValidityDates = (issueDate, months) => {
  const endDate = addMonthsToDateInput(issueDate, months);
  return {
    validity: endDate,
    nextRenewal: endDate,
  };
};
