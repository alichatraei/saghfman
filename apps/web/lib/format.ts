const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** 12500 → ۱۲٬۵۰۰ (Persian digits with thousands separators). */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? value : String(value);
  const withSeparators = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toPersianDigits(withSeparators);
}

/** Full Toman amount, e.g. «۲۶٬۰۰۰٬۰۰۰٬۰۰۰ تومان». */
export function formatToman(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'توافقی';
  return `${formatNumber(value)} تومان`;
}

/** Compact human amount, e.g. «۲۶ میلیارد تومان». */
export function formatTomanShort(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'توافقی';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'توافقی';
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `${toPersianDigits(billions % 1 === 0 ? billions : billions.toFixed(1))} میلیارد تومان`;
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${toPersianDigits(millions % 1 === 0 ? millions : millions.toFixed(0))} میلیون تومان`;
  }
  return formatToman(amount);
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

/** Gregorian ISO date → Jalali «۱۴۰۳/۰۲/۲۵» using the platform calendar. */
export function formatJalali(
  iso: string | null | undefined,
  style: 'numeric' | 'long' = 'long',
): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tehran',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const year = get('year').replace(/\D/g, '');
  const month = get('month');
  const day = get('day');
  if (style === 'long') {
    const monthName = JALALI_MONTHS[Number(month) - 1] ?? '';
    return `${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;
  }
  return toPersianDigits(`${year}/${month}/${day}`);
}

export function relativeFromNow(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return 'امروز';
  if (days === 1) return 'دیروز';
  if (days < 30) return `${toPersianDigits(days)} روز پیش`;
  const months = Math.floor(days / 30);
  return `${toPersianDigits(months)} ماه پیش`;
}

/** Persian digits → ASCII, so form input works with either keyboard. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (char) => {
    const persian = '۰۱۲۳۴۵۶۷۸۹'.indexOf(char);
    if (persian > -1) return String(persian);
    return String('٠١٢٣٤٥٦٧٨٩'.indexOf(char));
  });
}

export function digitsOnly(input: string): string {
  return toEnglishDigits(input).replace(/\D/g, '');
}

/** «۰۹۱۲ ۳۴۵ ۶۷۸۹» for display. */
export function formatMobile(phone: string): string {
  const digits = digitsOnly(phone);
  if (digits.length !== 11) return toPersianDigits(phone);
  return toPersianDigits(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
}

export function telHref(phone: string): string {
  return `tel:${toEnglishDigits(phone).replace(/[^\d+]/g, '')}`;
}

/**
 * ISO → مقدار <input type="datetime-local">.
 * ورودی datetime-local منطقه زمانی ندارد و به وقت محلی خوانده می‌شود، پس
 * نباید با toISOString (که UTC می‌دهد) پر شود — وگرنه تاریخ ۳:۳۰ ساعت عقب می‌افتد.
 */
export function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** مقدار <input type="datetime-local"> → ISO با منطقه زمانی درست. */
export function fromLocalInputValue(value: string): string {
  return value ? new Date(value).toISOString() : '';
}