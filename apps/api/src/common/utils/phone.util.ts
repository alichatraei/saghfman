import { toEnglishDigits } from './slug.util';

const IR_MOBILE = /^09\d{9}$/;

/** Normalises 0912…, +98912…, ۰۹۱۲… into the canonical 09xxxxxxxxx form. */
export function normalizeIranMobile(input: string): string | null {
  let value = toEnglishDigits(input).replace(/[\s\-()]/g, '');
  if (value.startsWith('+98')) value = `0${value.slice(3)}`;
  else if (value.startsWith('0098')) value = `0${value.slice(4)}`;
  else if (value.startsWith('98') && value.length === 12) value = `0${value.slice(2)}`;
  else if (value.startsWith('9') && value.length === 10) value = `0${value}`;
  return IR_MOBILE.test(value) ? value : null;
}

export function maskMobile(phone: string): string {
  return phone.length === 11 ? `${phone.slice(0, 4)}***${phone.slice(7)}` : '***';
}
