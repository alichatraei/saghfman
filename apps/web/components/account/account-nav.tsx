'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Heart, User } from 'lucide-react';

import { cn } from '@/lib/cn';

const ITEMS = [
  {
    href: '/account/listings',
    label: 'آگهی‌های من',
    icon: FileText,
  },
  {
    href: '/account/favorites',
    label: 'علاقه‌مندی‌ها',
    icon: Heart,
  },
  {
    href: '/account/profile',
    label: 'پروفایل کاربر',
    icon: User,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="حساب کاربری"
      className="
        overflow-hidden
        rounded-[var(--radius-lg)]
        border
        border-[var(--line)]
        bg-white
        p-2
        shadow-[var(--shadow-card)]
        lg:sticky
        lg:top-28
      "
    >
      <ul
        className="
          hide-scrollbar
          flex
          gap-1.5
          overflow-x-auto
          lg:flex-col
          lg:overflow-visible
        "
      >
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="shrink-0 lg:w-full">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  `
                    group
                    relative
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2.5
                    whitespace-nowrap
                    rounded-[var(--radius-sm)]
                    border
                    px-4
                    py-3
                    text-[15px]
                    transition-all
                    duration-200

                    lg:justify-start
                  `,
                  active
                    ? `
                      border-[var(--green-200)]
                      bg-[var(--green-soft)]
                      font-semibold
                      text-[var(--navy)]
                      shadow-[0_3px_12px_rgba(65,181,140,0.08)]
                    `
                    : `
                      border-transparent
                      bg-transparent
                      font-medium
                      text-[var(--text-secondary)]

                      hover:border-[var(--line-soft)]
                      hover:bg-[var(--background-soft)]
                      hover:text-[var(--navy)]
                    `,
                )}
              >
                {/* Active indicator */}
                <span
                  aria-hidden
                  className={cn(
                    `
                      absolute
                      right-0
                      hidden
                      h-6
                      w-[3px]
                      rounded-full
                      bg-[var(--green)]
                      transition-opacity
                      lg:block
                    `,
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />

                <Icon
                  aria-hidden
                  strokeWidth={active ? 2 : 1.8}
                  className={cn(
                    `
                      h-5
                      w-5
                      shrink-0
                      transition-colors
                      duration-200
                    `,
                    active
                      ? 'text-[var(--green-700)]'
                      : `
                        text-[var(--text-muted)]
                        group-hover:text-[var(--green-600)]
                      `,
                  )}
                />

                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
