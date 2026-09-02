import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Wordmark + roof/house monogram in gold, matching the brand sheet. */
export function Logo({
  href = '/',
  className,
  tone = 'light',
}: {
  href?: string;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-3', className)}
      aria-label="سقف من — صفحه اصلی"
    >
      <span
        className="text-xl font-bold tracking-tight sm:text-2xl"
        style={{ color: tone === 'light' ? '#FFFFFF' : '#08263A' }}
      >
        سقف من
      </span>
    </Link>
  );
}
