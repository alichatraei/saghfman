const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Converts Persian/Arabic digits in a string to ASCII digits. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (char) => {
    const pi = PERSIAN_DIGITS.indexOf(char);
    if (pi > -1) return String(pi);
    return String(ARABIC_DIGITS.indexOf(char));
  });
}

/**
 * Builds an SEO-friendly slug. Persian characters are preserved because
 * Google indexes UTF-8 slugs well and Persian keywords help ranking, but the
 * ASCII transliteration of the property type keeps the URL readable.
 */
export function slugify(input: string): string {
  return toEnglishDigits(input)
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u200e]/g, '-')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}

/** e.g. apartment-125m-shahrak-gharb-12345 */
export function buildPropertySlug(parts: {
  typeSlug: string;
  area: number;
  neighborhoodSlug: string;
  code: string;
}): string {
  return slugify(`${parts.typeSlug}-${parts.area}m-${parts.neighborhoodSlug}-${parts.code}`);
}

/** Short numeric public code used in URLs and support conversations. */
export function generatePropertyCode(): string {
  return String(Math.floor(10000 + Math.random() * 89999));
}
