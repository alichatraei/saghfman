'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';
import { toPersianDigits } from '@/lib/format';

export const STEPS = ['مشخصات ملک', 'قیمت و شرایط', 'تصاویر و توضیحات'];

export function Stepper({ current }: { current: number }) {
  const progress = STEPS.length > 1 ? (current / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="mb-8 w-full">
      <ol
        className="
          relative
          grid
          w-full
          grid-cols-3
        "
        aria-label="مراحل ثبت آگهی"
      >
        {/* Background connector */}
        <div
          aria-hidden
          className="
            absolute
            left-[16.666%]
            right-[16.666%]
            top-[21px]
            h-[3px]
            overflow-hidden
            rounded-full
            bg-[var(--line)]
          "
        >
          {/* Completed progress */}
          <div
            className="
              absolute
              right-0
              top-0
              h-full
              rounded-full
              bg-[var(--green-600)]
              transition-[width]
              duration-500
              ease-out
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li
              key={label}
              className="
                relative
                z-10
                flex
                min-w-0
                flex-col
                items-center
                text-center
              "
            >
              {/* Step circle */}
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  `
                    num
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center

                    rounded-full
                    border-2

                    text-[15px]
                    font-bold

                    transition-all
                    duration-300
                  `,

                  done &&
                    `
                      border-[var(--green-600)]
                      bg-[var(--green-600)]
                      text-white

                      shadow-[0_4px_14px_rgba(47,155,119,0.18)]
                    `,

                  active &&
                    `
                      border-[var(--green)]
                      bg-[var(--green-soft)]
                      text-[var(--navy)]

                      shadow-[0_0_0_5px_rgba(65,181,140,0.10)]
                    `,

                  !done &&
                    !active &&
                    `
                      border-[var(--line-strong)]
                      bg-white
                      text-[var(--text-muted)]
                    `,
                )}
              >
                {done ? (
                  <Check aria-hidden className="h-5 w-5" strokeWidth={2.3} />
                ) : (
                  toPersianDigits(index + 1)
                )}
              </span>

              {/* Label */}
              <span
                className={cn(
                  `
                    mt-2.5
                    max-w-[105px]
                    text-[11px]
                    leading-5

                    transition-colors

                    sm:max-w-none
                    sm:text-sm
                  `,

                  active &&
                    `
                      font-bold
                      text-[var(--navy)]
                    `,

                  done &&
                    `
                      font-medium
                      text-[var(--green-700)]
                    `,

                  !done &&
                    !active &&
                    `
                      font-normal
                      text-[var(--text-muted)]
                    `,
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
