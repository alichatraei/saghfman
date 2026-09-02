'use client';

import { Heart } from 'lucide-react';

import { cn } from '@/lib/cn';
import { useFavoriteIds, useToggleFavorite } from '@/lib/hooks';

export function FavoriteButton({
  propertyId,
  className,
  size = 'md',
}: {
  propertyId: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const { data: ids } = useFavoriteIds();
  const { toggle, isPending } = useToggleFavorite();

  const favorited = Boolean(ids?.includes(propertyId));

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        toggle(propertyId, favorited);
      }}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      className={cn(
        `
          group
          flex
          items-center
          justify-center
          rounded-full
          border
          backdrop-blur-md
          transition-all
          duration-200

          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[rgba(65,181,140,0.16)]

          disabled:cursor-not-allowed
          disabled:opacity-60
        `,
        favorited
          ? `
            border-[var(--green-200)]
            bg-[var(--green-soft)]
            text-[var(--green-700)]
            shadow-[0_4px_14px_rgba(65,181,140,0.18)]

            hover:border-[var(--green-300)]
            hover:bg-[var(--green-100)]
          `
          : `
            border-white/70
            bg-white/95
            text-[var(--navy)]
            shadow-[var(--shadow-sm)]

            hover:scale-105
            hover:border-[var(--green-200)]
            hover:bg-[var(--green-soft)]
            hover:text-[var(--green-700)]
          `,
        size === 'md' ? 'h-11 w-11' : 'h-9 w-9',
        className,
      )}
    >
      <Heart
        aria-hidden
        strokeWidth={1.9}
        className={cn(
          `
            transition-all
            duration-200
            group-hover:scale-105
          `,
          size === 'md' ? 'h-5 w-5' : 'h-4 w-4',
          favorited &&
            `
              fill-[var(--green)]
              text-[var(--green)]
            `,
        )}
      />
    </button>
  );
}
