export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

export function normalizePhoneInput(value: string) {
  return value.replace(/[^\d+()\-\s]/g, '').trim();
}

export function isValidPhone(value: string) {
  const normalized = value.replace(/\s|\(|\)|-/g, '');
  return PHONE_PATTERN.test(normalized);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getTrimmedValue(value: string) {
  return value.trim();
}
