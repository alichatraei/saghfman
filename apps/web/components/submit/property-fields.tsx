'use client';

import { Checkbox, FieldError, Input, Label, Select, Toggle } from '@/components/ui/field';
import { digitsOnly, toPersianDigits } from '@/lib/format';
import type { AmenityDto } from '@saghf/types';

/**
 * Field definitions shared by the «ثبت آگهی» wizard and the «ویرایش آگهی» form,
 * so both stay in sync when the questionnaire changes.
 */

export const HEATING_OPTIONS = [
  { value: 'PACKAGE', label: 'پکیج' },
  { value: 'HEATER', label: 'بخاری' },
  { value: 'CENTRAL', label: 'شوفاژ مرکزی' },
  { value: 'FLOOR_HEATING', label: 'گرمایش از کف' },
  { value: 'NONE', label: 'ندارد' },
];

export const COOLING_OPTIONS = [
  { value: 'SPLIT', label: 'کولر گازی' },
  { value: 'EVAPORATIVE', label: 'کولر آبی' },
  { value: 'CENTRAL', label: 'چیلر مرکزی' },
  { value: 'NONE', label: 'ندارد' },
];

export const CABINET_OPTIONS = [
  { value: 'MDF', label: 'ام‌دی‌اف (MDF)' },
  { value: 'METAL', label: 'فلزی' },
  { value: 'WOOD', label: 'چوبی' },
  { value: 'OTHER', label: 'سایر' },
];

export const FLOOR_OPTIONS = [
  { value: 'CARPET', label: 'موکت' },
  { value: 'CERAMIC', label: 'سرامیک' },
  { value: 'PARQUET', label: 'پارکت' },
  { value: 'STONE', label: 'سنگ' },
  { value: 'OTHER', label: 'سایر' },
];

export const WALL_OPTIONS = [
  { value: 'WALLPAPER', label: 'کاغذ دیواری' },
  { value: 'PAINT', label: 'رنگ' },
  { value: 'OTHER', label: 'سایر' },
];

export const DEED_TYPES = [
  { value: 'SIX_DANG', label: 'شش‌دانگ' },
  { value: 'ENDOWMENT', label: 'وقفی' },
  { value: 'COOPERATIVE', label: 'تعاونی' },
  { value: 'AGREEMENT', label: 'قولنامه‌ای' },
  { value: 'OTHER', label: 'سایر' },
];

/** Transactions where deposit + monthly rent replace a single sale price. */
export const RENTAL_TRANSACTIONS = ['rent', 'full-mortgage', 'mortgage-rent'];

/** Property types that own a plot, so «متراژ زمین» is asked only for them. */
export const LAND_AREA_TYPES = ['villa', 'house', 'land', 'garden'];

/** Amenities handled by dedicated toggles, hidden from the generic list. */
export const DEDICATED_AMENITIES = ['elevator', 'parking', 'storage', 'balcony', 'terrace'];

export const TITLE_MAX = 40;
export const DESCRIPTION_MAX = 700;
export const MAX_IMAGES = 15;

const BOX =
  'rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-soft)] px-4';

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  required,
  error,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <Label htmlFor={id} hint={hint} required={required}>
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) =>
          onChange(
            maxLength
              ? digitsOnly(event.target.value).slice(0, maxLength)
              : digitsOnly(event.target.value),
          )
        }
        inputMode="numeric"
        className="num"
        invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </div>
  );
}

export function ChoiceField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function YesNoField({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={BOX}>
      <Toggle id={id} checked={checked} onChange={onChange} label={label} description={description} />
    </div>
  );
}

export function RoomsField({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} required>
        تعداد اتاق
      </Label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)} invalid={Boolean(error)}>
        <option value="">انتخاب کنید</option>
        {[0, 1, 2, 3, 4, 5, 6].map((count) => (
          <option key={count} value={String(count)}>
            {count === 0 ? 'بدون اتاق' : toPersianDigits(count)}
          </option>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

/** The generic amenity checkboxes, minus the ones that have their own toggle. */
export function ExtraAmenities({
  prefix,
  amenities,
  selected,
  onToggle,
}: {
  prefix: string;
  amenities: AmenityDto[] | undefined;
  selected: string[];
  onToggle: (slug: string, checked: boolean) => void;
}) {
  const extras = (amenities ?? []).filter((item) => !DEDICATED_AMENITIES.includes(item.slug));
  if (extras.length === 0) return null;

  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-medium text-brand">سایر امکانات</p>
      <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
        {extras.map((amenity) => (
          <Checkbox
            key={amenity.slug}
            id={`${prefix}-${amenity.slug}`}
            checked={selected.includes(amenity.slug)}
            onChange={(checked) => onToggle(amenity.slug, checked)}
            label={amenity.title}
          />
        ))}
      </div>
    </div>
  );
}

/** Live character counter shown under the description box. */
export function CharacterCounter({ length, max }: { length: number; max: number }) {
  const remaining = Math.max(0, max - length);
  const nearLimit = remaining <= 50;
  return (
    <p className={`num mt-1.5 text-sm ${nearLimit ? 'text-warning' : 'text-muted'}`}>
      {toPersianDigits(length)} از {toPersianDigits(max)} کاراکتر
      {nearLimit && ` — ${toPersianDigits(remaining)} کاراکتر باقی مانده`}
    </p>
  );
}

/**
 * Keeps the amenity slug list in sync with the dedicated toggles, so the
 * listing filters (which query amenities) keep working.
 */
export function syncAmenities(
  selected: string[],
  flags: { elevator: boolean; parking: boolean; storage: boolean; terrace: boolean },
): string[] {
  const kept = selected.filter((slug) => !DEDICATED_AMENITIES.includes(slug));
  if (flags.elevator) kept.push('elevator');
  if (flags.parking) kept.push('parking');
  if (flags.storage) kept.push('storage');
  if (flags.terrace) kept.push('balcony');
  return kept;
}
