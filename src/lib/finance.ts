export const FINANCE_MONTH_OPTIONS = [
  { value: '2026-05', label: 'Май 2026' },
  { value: '2026-04', label: 'Апрель 2026' },
  { value: '2026-03', label: 'Март 2026' },
  { value: '2026-02', label: 'Февраль 2026' },
] as const;

export const DEFAULT_FINANCE_MONTH = FINANCE_MONTH_OPTIONS[0]?.value ?? '2026-05';

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export function getMonthDates(monthStr: string): [string, string] {
  const [year, month] = monthStr.split('-');
  const startDate = `${year}-${month}-01T00:00:00.000Z`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}T23:59:59.999Z`;
  return [startDate, endDate];
}

export function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}
