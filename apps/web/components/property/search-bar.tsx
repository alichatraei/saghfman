'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { usePropertyTypes, useTransactionTypes } from '@/lib/hooks';
import { buildQuery } from '@/lib/api';
import { cn } from '@/lib/cn';

/** The two search modes. Each one has its own transactions and price scale. */
type Mode = 'buy' | 'rent';

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'buy', label: 'خرید و فروش', hint: 'جستجو بر اساس قیمت کل ملک' },
  { value: 'rent', label: 'اجاره', hint: 'جستجو بر اساس مبلغ ودیعه' },
];

/** Transaction slugs that belong to each mode. */
const MODE_TRANSACTIONS: Record<Mode, string[]> = {
  buy: ['sale', 'presale', 'exchange'],
  rent: ['rent', 'full-mortgage', 'mortgage-rent'],
};

const SALE_BUCKETS = [
  { label: 'تا ۵ میلیارد تومان', max: 5_000_000_000 },
  { label: '۵ تا ۱۰ میلیارد تومان', min: 5_000_000_000, max: 10_000_000_000 },
  { label: '۱۰ تا ۲۰ میلیارد تومان', min: 10_000_000_000, max: 20_000_000_000 },
  { label: 'بیش از ۲۰ میلیارد تومان', min: 20_000_000_000 },
];

const RENT_BUCKETS = [
  { label: 'ودیعه تا ۲۰۰ میلیون تومان', max: 200_000_000 },
  { label: '۲۰۰ تا ۵۰۰ میلیون تومان', min: 200_000_000, max: 500_000_000 },
  { label: '۵۰۰ میلیون تا ۱ میلیارد تومان', min: 500_000_000, max: 1_000_000_000 },
  { label: 'بیش از ۱ میلیارد تومان', min: 1_000_000_000 },
];

export function SearchBar({
  defaultTransaction,
  compact,
}: {
  defaultTransaction?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { data: propertyTypes } = usePropertyTypes();
  const { data: transactionTypes } = useTransactionTypes();

  const initialMode: Mode = MODE_TRANSACTIONS.rent.includes(defaultTransaction ?? '')
    ? 'rent'
    : 'buy';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [q, setQ] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [transaction, setTransaction] = useState(defaultTransaction ?? '');
  const [bucket, setBucket] = useState('');

  const buckets = mode === 'rent' ? RENT_BUCKETS : SALE_BUCKETS;

  // Only the transactions that belong to the active mode are offered.
  const modeTransactions = useMemo(
    () => (transactionTypes ?? []).filter((type) => MODE_TRANSACTIONS[mode].includes(type.slug)),
    [transactionTypes, mode],
  );

  const switchMode = (next: Mode) => {
    setMode(next);
    setTransaction('');
    setBucket('');
  };

  const submit = () => {
    const selected = bucket === '' ? undefined : buckets[Number(bucket)];

    // No specific transaction picked ⇒ search the whole mode at once.
    const kindFilter = transaction ? { transaction } : { transactionGroup: mode };

    // In rent mode the amount refers to the deposit, not the sale price.
    const priceFilter =
      mode === 'rent'
        ? { minDeposit: selected?.min, maxDeposit: selected?.max }
        : { minPrice: selected?.min, maxPrice: selected?.max };

    router.push(
      `/properties${buildQuery({
        q: q.trim(),
        propertyType,
        ...kindFilter,
        ...priceFilter,
      })}`,
    );
  };

  return (
    <div className="w-full">
      {/* Mode tabs — buying and renting are two different searches. */}
      <div role="tablist" aria-label="نوع جستجو" className="flex w-full gap-2 px-4 pt-4 sm:px-5">
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={mode === item.value}
            onClick={() => switchMode(item.value)}
            className={cn(
              'rounded-[var(--radius-md)] w-full px-5 py-2.5 text-[15px] transition-all duration-200',
              mode === item.value
                ? 'bg-[var(--navy)] font-medium text-white shadow-[var(--shadow-card)]'
                : 'border border-[var(--line)] bg-white text-[var(--text-secondary)] hover:border-[var(--green-300)] hover:text-[var(--navy)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex w-full flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center"
        role="search"
        aria-label={mode === 'rent' ? 'جستجوی ملک اجاره‌ای' : 'جستجوی ملک برای خرید'}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="جستجو در شهر، منطقه یا محله"
            className="pr-12"
            aria-label="جستجو در شهر، منطقه یا محله"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:flex lg:items-center">
          <Select
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            aria-label="نوع ملک"
            className="lg:w-44"
          >
            <option value="">نوع ملک</option>
            {propertyTypes?.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.title}
              </option>
            ))}
          </Select>

          <Select
            value={transaction}
            onChange={(event) => setTransaction(event.target.value)}
            aria-label="نوع معامله"
            className="lg:w-44"
          >
            <option value="">{mode === 'rent' ? 'همه انواع اجاره' : 'همه انواع خرید'}</option>
            {modeTransactions.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.title}
              </option>
            ))}
          </Select>

          {!compact && (
            <Select
              value={bucket}
              onChange={(event) => setBucket(event.target.value)}
              aria-label={mode === 'rent' ? 'محدوده ودیعه' : 'محدوده قیمت'}
              className="w-full"
            >
              <option value="">{mode === 'rent' ? 'مبلغ ودیعه' : 'قیمت'}</option>
              {buckets.map((item, index) => (
                <option key={item.label} value={String(index)}>
                  {item.label}
                </option>
              ))}
            </Select>
          )}
        </div>

        <Button type="submit" size="md" className="lg:w-40">
          <Search className="h-5 w-5" />
          جستجو
        </Button>
      </form>

      {!compact && (
        <p className="px-4 pb-4 text-xs text-muted sm:px-5">
          {MODES.find((item) => item.value === mode)?.hint}
        </p>
      )}
    </div>
  );
}
