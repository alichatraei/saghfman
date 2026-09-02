import { cn } from '@/lib/cn';
import { LinkButton } from './button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        gap-3
        rounded-[var(--radius-lg)]
        border
        border-[var(--line)]
        bg-white
        px-6
        py-16
        text-center
        shadow-[var(--shadow-sm)]
      "
    >
      {icon && (
        <div
          className="
            mb-1
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border
            border-[var(--green-200)]
            bg-[var(--green-soft)]
            text-[var(--green-700)]
          "
        >
          {icon}
        </div>
      )}

      <h3
        className="
          text-lg
          font-bold
          text-[var(--navy)]
        "
      >
        {title}
      </h3>

      <p
        className="
          max-w-md
          text-[15px]
          leading-7
          text-[var(--text-secondary)]
        "
      >
        {description}
      </p>

      {actionLabel && actionHref && (
        <LinkButton href={actionHref} variant="accent" className="mt-3">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="surface flex flex-col items-center gap-3 border-danger/30 px-6 py-12 text-center">
      <h3 className="text-lg font-bold text-danger">مشکلی پیش آمد</h3>
      <p className="max-w-md text-[15px] text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded border border-line px-5 py-2 text-sm font-medium text-brand hover:border-gold"
        >
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
