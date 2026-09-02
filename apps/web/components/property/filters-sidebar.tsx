'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox, Input } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { buildQuery } from '@/lib/api';
import { digitsOnly, formatNumber } from '@/lib/format';
import { useAmenities, usePropertyTypes } from '@/lib/hooks';

const ROOM_OPTIONS = [
  { value: '', label: 'همه' },
  { value: '1', label: '۱' },
  { value: '2', label: '۲' },
  { value: '3', label: '۳' },
  { value: '4', label: '۴' },
  { value: '5', label: '۵+' },
];

export function FiltersSidebar() {
  const router = useRouter();
  const params = useSearchParams();

  const { data: propertyTypes } = usePropertyTypes();
  const { data: amenities } = useAmenities();

  const current = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const [minPrice, setMinPrice] = useState(current.minPrice ?? '');

  const [maxPrice, setMaxPrice] = useState(current.maxPrice ?? '');

  const [minArea, setMinArea] = useState(current.minArea ?? '');

  const [maxArea, setMaxArea] = useState(current.maxArea ?? '');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    type: true,
    rooms: true,
    amenities: true,
    area: true,
  });

  const selectedAmenities = (current.amenities ?? '').split(',').filter(Boolean);

  const apply = (patch: Record<string, string | undefined>) => {
    const next = {
      ...current,
      ...patch,
      page: undefined,
    };

    router.push(`/properties${buildQuery(next)}`, {
      scroll: false,
    });
  };

  const toggleAmenity = (slug: string, checked: boolean) => {
    const next = checked
      ? [...selectedAmenities, slug]
      : selectedAmenities.filter((item) => item !== slug);

    apply({
      amenities: next.length ? next.join(',') : undefined,
    });
  };

  const reset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');

    router.push('/properties');
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const open = openSections[id];

    return (
      <div
        className="
          border-b
          border-[var(--line-soft)]
          py-5
          last:border-b-0
        "
      >
        <button
          type="button"
          onClick={() =>
            setOpenSections((state) => ({
              ...state,
              [id]: !state[id],
            }))
          }
          aria-expanded={open}
          className="
            group
            flex w-full
            items-center
            justify-between
            gap-4
            text-[15px]
            font-semibold
            text-[var(--navy)]
          "
        >
          <span>{title}</span>

          <span
            className="
              flex h-7 w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[var(--background-soft)]
              text-[var(--text-secondary)]
              transition-all
              duration-200
              group-hover:bg-[var(--green-soft)]
              group-hover:text-[var(--green-700)]
            "
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
              strokeWidth={1.8}
            />
          </span>
        </button>

        {open && <div className="mt-4">{children}</div>}
      </div>
    );
  };

  return (
    <aside
      className="
        h-fit
        rounded-[var(--radius-lg)]
        border
        border-[var(--line)]
        bg-white
        p-5
        shadow-[var(--shadow-card)]
        lg:sticky
        lg:top-28
      "
      aria-label="فیلترهای جستجو"
    >
      {/* Header */}
      <div
        className="
          flex items-center
          justify-between
          border-b
          border-[var(--line)]
          pb-4
        "
      >
        <h2
          className="
            text-[17px]
            font-bold
            text-[var(--navy)]
          "
        >
          فیلترها
        </h2>

        <span
          className="
            flex h-9 w-9
            items-center
            justify-center
            rounded-full
            bg-[var(--green-soft)]
            text-[var(--green-700)]
          "
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>

      {/* Price */}
      <Section id="price" title="محدوده قیمت">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Input
            value={minPrice}
            onChange={(event) => setMinPrice(digitsOnly(event.target.value))}
            onBlur={() =>
              apply({
                minPrice: minPrice || undefined,
              })
            }
            placeholder="از"
            inputMode="numeric"
            aria-label="حداقل قیمت"
          />

          <span className="text-sm text-[var(--text-muted)]">تا</span>

          <Input
            value={maxPrice}
            onChange={(event) => setMaxPrice(digitsOnly(event.target.value))}
            onBlur={() =>
              apply({
                maxPrice: maxPrice || undefined,
              })
            }
            placeholder="تا"
            inputMode="numeric"
            aria-label="حداکثر قیمت"
          />
        </div>

        <div
          className="
            mt-3
            rounded-[10px]
            bg-[var(--background-soft)]
            px-3
            py-2.5
            text-xs
            leading-6
            text-[var(--text-secondary)]
          "
        >
          {minPrice || maxPrice
            ? `${minPrice ? formatNumber(minPrice) : '۰'} تا ${
                maxPrice ? formatNumber(maxPrice) : 'بی‌نهایت'
              } تومان`
            : 'بدون محدودیت قیمت'}
        </div>
      </Section>

      {/* Type */}
      <Section id="type" title="نوع ملک">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={!current.propertyType}
            onClick={() =>
              apply({
                propertyType: undefined,
              })
            }
            label="همه"
          />

          {propertyTypes?.map((type) => (
            <FilterChip
              key={type.slug}
              active={current.propertyType === type.slug}
              onClick={() =>
                apply({
                  propertyType: type.slug,
                })
              }
              label={type.title}
            />
          ))}
        </div>
      </Section>

      {/* Rooms */}
      <Section id="rooms" title="تعداد اتاق">
        <div className="flex flex-wrap gap-2">
          {ROOM_OPTIONS.map((option) => (
            <FilterChip
              key={option.label}
              active={(current.rooms ?? '') === option.value}
              onClick={() =>
                apply({
                  rooms: option.value || undefined,
                })
              }
              label={option.label}
            />
          ))}
        </div>
      </Section>

      {/* Area */}
      <Section id="area" title="متراژ">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Input
            value={minArea}
            onChange={(event) => setMinArea(digitsOnly(event.target.value))}
            onBlur={() =>
              apply({
                minArea: minArea || undefined,
              })
            }
            placeholder="از"
            inputMode="numeric"
            aria-label="حداقل متراژ"
          />

          <span className="text-sm text-[var(--text-muted)]">تا</span>

          <Input
            value={maxArea}
            onChange={(event) => setMaxArea(digitsOnly(event.target.value))}
            onBlur={() =>
              apply({
                maxArea: maxArea || undefined,
              })
            }
            placeholder="تا"
            inputMode="numeric"
            aria-label="حداکثر متراژ"
          />
        </div>
      </Section>

      {/* Amenities */}
      <Section id="amenities" title="امکانات">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {amenities?.map((amenity) => (
            <Checkbox
              key={amenity.slug}
              id={`amenity-${amenity.slug}`}
              checked={selectedAmenities.includes(amenity.slug)}
              onChange={(checked) => toggleAmenity(amenity.slug, checked)}
              label={amenity.title}
            />
          ))}
        </div>
      </Section>

      {/* Reset */}
      <Button
        variant="ghost"
        block
        onClick={reset}
        className="
          mt-4
          gap-2
          text-[var(--text-secondary)]
          transition-colors
          hover:bg-[var(--danger-soft)]
          hover:text-[var(--danger)]
        "
      >
        <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
        پاک کردن همه فیلترها
      </Button>
    </aside>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        `
          min-h-10
          rounded-[10px]
          border
          px-4
          py-2
          text-sm
          transition-all
          duration-200
        `,
        active
          ? `
            border-[var(--green-300)]
            bg-[var(--green-soft)]
            font-semibold
            text-[var(--green-700)]
            shadow-[0_2px_8px_rgba(65,181,140,0.10)]
          `
          : `
            border-[var(--line)]
            bg-white
            text-[var(--text-secondary)]
            hover:border-[var(--green-300)]
            hover:bg-[var(--green-50)]
            hover:text-[var(--navy)]
          `,
      )}
    >
      {label}
    </button>
  );
}
