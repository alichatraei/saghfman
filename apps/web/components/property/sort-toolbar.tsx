'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ArrowDownWideNarrow } from 'lucide-react';
import { Select } from '@/components/ui/field';
import { buildQuery } from '@/lib/api';
import { formatNumber } from '@/lib/format';

const SORTS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'area_desc', label: 'بیشترین متراژ' },
];

export function SortToolbar({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = useMemo(() => Object.fromEntries(params.entries()), [params]);

  return (
    <div className="surface mb-5 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
      <p className="text-[15px] text-muted">
        <span className="num font-bold text-brand">{formatNumber(total)}</span> آگهی پیدا شد
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <ArrowDownWideNarrow className="h-5 w-5 shrink-0 text-gold" aria-hidden />
        <label htmlFor="sort" className="shrink-0 text-sm text-muted">
          مرتب‌سازی
        </label>
        <Select
          id="sort"
          value={current.sort ?? 'newest'}
          onChange={(event) =>
            router.push(
              `/properties${buildQuery({ ...current, sort: event.target.value, page: undefined })}`,
              {
                scroll: false,
              },
            )
          }
          className="w-full sm:w-44"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
