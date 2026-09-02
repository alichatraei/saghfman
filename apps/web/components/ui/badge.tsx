import { cn } from '@/lib/cn';

type Tone =
  | 'accent'
  | 'gold' // legacy alias — بعداً می‌تونی حذفش کنی
  | 'navy'
  | 'success'
  | 'danger'
  | 'muted'
  | 'warning'
  | 'info';

const TONES: Record<Tone, string> = {
  /* Brand accent */
  accent: 'border border-[var(--green-200)] bg-[var(--green-soft)] text-[var(--green-700)]',

  /* Legacy alias — همان accent */
  gold: 'border border-[var(--green-200)] bg-[var(--green-soft)] text-[var(--green-700)]',

  /* Primary brand */
  navy: 'border border-[var(--navy)] bg-[var(--navy)] text-white',

  /* States */
  success: 'border border-[var(--green-200)] bg-[var(--success-soft)] text-[var(--success)]',

  danger: 'border border-red-200 bg-[var(--danger-soft)] text-[var(--danger)]',

  warning: 'border border-orange-200 bg-[var(--warning-soft)] text-[var(--warning)]',

  info: 'border border-sky-100 bg-[var(--info-soft)] text-[var(--info)]',

  /* Neutral */
  muted: 'border border-[var(--line)] bg-[var(--background-soft)] text-[var(--text-secondary)]',
};

export function Badge({
  tone = 'muted',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        `
          inline-flex
          items-center
          gap-1
          whitespace-nowrap
          rounded-[var(--radius-sm)]
          px-3
          py-1
          text-xs
          font-medium
          leading-6
        `,
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
