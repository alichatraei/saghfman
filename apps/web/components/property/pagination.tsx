'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buildQuery } from '@/lib/api';
import { toPersianDigits } from '@/lib/format';

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = useMemo(() => Object.fromEntries(params.entries()), [params]);

  if (totalPages <= 1) return null;

  const go = (next: number) =>
    router.push(`/properties${buildQuery({ ...current, page: next > 1 ? next : undefined })}`);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  return (
    <nav aria-label="صفحه‌بندی" className="mt-8 flex items-center justify-center gap-2">
      {/* RTL: «قبلی» points right. */}
      <PageButton onClick={() => go(page - 1)} disabled={page <= 1} label="صفحه قبلی">
        <ChevronRight className="h-4 w-4" />
      </PageButton>

      {pages.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 && pages[index - 1] !== item - 1 && <span className="text-muted">…</span>}
          <button
            type="button"
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'num h-11 min-w-11 rounded border px-3 text-[15px] transition-colors',
              item === page
                ? 'border-gold bg-gold font-bold text-brand'
                : 'border-line bg-white text-brand hover:border-gold',
            )}
          >
            {toPersianDigits(item)}
          </button>
        </span>
      ))}

      <PageButton onClick={() => go(page + 1)} disabled={page >= totalPages} label="صفحه بعدی">
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded border border-line bg-white text-brand transition-colors hover:border-gold disabled:opacity-40"
    >
      {children}
    </button>
  );
}
