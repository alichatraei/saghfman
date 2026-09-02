'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type { PropertyImageDto } from '@saghf/types';

import { toPersianDigits } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Gallery({
  images,
  title,
}: {
  images: PropertyImageDto[];
  title: string;
}) {
  const [index, setIndex] = useState(0);

  const total = images.length;
  const current = images[index];

  const step = (delta: number) => {
    if (!total) return;

    setIndex(
      (value) =>
        (value + delta + total) % total,
    );
  };

  if (total === 0) {
    return (
      <div
        className="
          flex
          h-[260px]
          w-full
          items-center
          justify-center

          rounded-[var(--radius-lg)]
          border
          border-[var(--line)]
          bg-white

          px-6
          text-center
          text-sm
          text-[var(--text-muted)]

          sm:h-[360px]
          lg:h-[460px]
        "
      >
        تصویری برای این ملک ثبت نشده است.
      </div>
    );
  }

  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden

        rounded-[var(--radius-lg)]
        border
        border-[var(--line)]
        bg-white

        p-2.5

        shadow-[var(--shadow-card)]

        sm:p-3
      "
      aria-label={`گالری تصاویر ${title}`}
    >
      {/* =========================
          Main Image
      ========================== */}

      <div
        className="
          relative
          h-[260px]
          w-full
          min-w-0
          overflow-hidden

          rounded-[var(--radius-md)]

          bg-[var(--background-soft)]

          sm:h-[380px]
          md:h-[440px]
          lg:h-[480px]
          xl:h-[520px]
        "
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt ?? title}
          fill
          priority={index === 0}
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 100vw,
            (max-width: 1280px) 65vw,
            850px
          "
          className="
            object-cover
            object-center
          "
        />

        {/* subtle overlay */}
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-[rgba(6,31,44,0.14)]
            via-transparent
            to-transparent
          "
        />

        {/* Counter */}
        <span
          className="
            num
            absolute
            right-3
            top-3
            z-10

            flex
            items-center
            gap-1.5

            rounded-full

            border
            border-white/15
            bg-[rgba(6,31,44,0.72)]

            px-3
            py-1.5

            text-xs
            font-medium
            text-white

            backdrop-blur-md

            sm:right-4
            sm:top-4
            sm:text-sm
          "
        >
          <Camera
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          {toPersianDigits(index + 1)}
          {' / '}
          {toPersianDigits(total)}
        </span>

        {/* Navigation */}
        {total > 1 && (
          <>
            <GalleryArrow
              side="right"
              onClick={() => step(-1)}
              label="تصویر قبلی"
            >
              <ChevronRight className="h-5 w-5" />
            </GalleryArrow>

            <GalleryArrow
              side="left"
              onClick={() => step(1)}
              label="تصویر بعدی"
            >
              <ChevronLeft className="h-5 w-5" />
            </GalleryArrow>
          </>
        )}
      </div>

      {/* =========================
          Thumbnails
      ========================== */}

      {total > 1 && (
        <div
          className="
            hide-scrollbar
            mt-2.5
            flex
            max-w-full
            gap-2
            overflow-x-auto
            overscroll-x-contain
            pb-0.5

            sm:mt-3
          "
        >
          {images.map(
            (image, imageIndex) => {
              const active =
                imageIndex === index;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() =>
                    setIndex(imageIndex)
                  }
                  aria-label={`نمایش تصویر ${toPersianDigits(
                    imageIndex + 1,
                  )}`}
                  aria-current={
                    active
                      ? 'true'
                      : undefined
                  }
                  className={cn(
                    `
                      relative
                      h-[64px]
                      w-[88px]
                      shrink-0
                      overflow-hidden

                      rounded-[10px]
                      border-2

                      bg-[var(--background-soft)]

                      transition-all
                      duration-200

                      sm:h-[72px]
                      sm:w-[100px]

                      md:h-20
                      md:w-28
                    `,
                    active
                      ? `
                        border-[var(--green)]
                        shadow-[0_3px_12px_rgba(65,181,140,0.16)]
                      `
                      : `
                        border-transparent
                        opacity-75

                        hover:border-[var(--green-200)]
                        hover:opacity-100
                      `,
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="112px"
                    className="
                      object-cover
                      object-center
                    "
                  />
                </button>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

function GalleryArrow({
  side,
  onClick,
  label,
  children,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        `
          absolute
          top-1/2
          z-10

          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          border
          border-white/60
          bg-white/90

          text-[var(--navy)]

          shadow-[var(--shadow-sm)]
          backdrop-blur-md

          transition-all
          duration-200

          hover:scale-105
          hover:bg-white

          sm:h-11
          sm:w-11
        `,
        side === 'left'
          ? 'left-2 sm:left-4'
          : 'right-2 sm:right-4',
      )}
    >
      {children}
    </button>
  );
}