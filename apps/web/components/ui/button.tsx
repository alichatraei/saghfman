'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Variant =
  | 'primary'
  | 'accent'
  | 'gold' // legacy alias
  | 'outline'
  | 'ghost'
  | 'danger';

type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  /* Petroleum blue */
  primary: `
    border border-[var(--navy)]
    bg-[var(--navy)]
    text-white

    hover:border-[var(--navy-alt)]
    hover:bg-[var(--navy-alt)]

    disabled:border-[var(--navy)]
  `,

  /* Brand green */
  accent: `
    border border-[var(--green)]
    bg-[var(--green)]
    text-[var(--navy)]

    shadow-[0_6px_20px_rgba(65,181,140,0.14)]

    hover:border-[var(--green-400)]
    hover:bg-[var(--green-400)]
  `,

  /*
   * Legacy compatibility.
   * Remove after replacing variant="gold" across the project.
   */
  gold: `
    border border-[var(--green)]
    bg-[var(--green)]
    text-[var(--navy)]

    shadow-[0_6px_20px_rgba(65,181,140,0.14)]

    hover:border-[var(--green-400)]
    hover:bg-[var(--green-400)]
  `,

  outline: `
    border border-[var(--line)]
    bg-white
    text-[var(--navy)]

    hover:border-[var(--green-300)]
    hover:bg-[var(--green-50)]
  `,

  ghost: `
    border border-transparent
    bg-transparent
    text-[var(--navy)]

    hover:bg-[var(--background-soft)]
  `,

  danger: `
    border border-[var(--danger)]
    bg-[var(--danger)]
    text-white

    hover:border-[var(--danger-hover)]
    hover:bg-[var(--danger-hover)]
  `,
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
};

const BASE = `
  inline-flex
  shrink-0
  select-none
  items-center
  justify-center
  gap-2
  whitespace-nowrap

  rounded-[var(--radius-md)]

  font-medium

  transition-all
  duration-200

  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-[rgba(65,181,140,0.16)]

  disabled:pointer-events-none
  disabled:cursor-not-allowed
  disabled:opacity-50
`;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="
            h-4
            w-4
            shrink-0
            animate-spin
            rounded-full
            border-2
            border-current
            border-t-transparent
          "
        />
      )}

      {children}
    </button>
  );
});

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
