'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Info, CheckCircle2, AlertTriangle, Megaphone, X, ArrowLeft } from 'lucide-react';
import type { BannerDto } from '@saghf/types';
import { cn } from '@/lib/cn';

const VARIANTS: Record<
  BannerDto['variant'],
  { wrapper: string; icon: React.ReactNode; cta: string }
> = {
  info: {
    wrapper: 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--navy)]',
    icon: <Info className="h-5 w-5 text-[var(--navy)]" />,
    cta: 'bg-[var(--navy)] text-white hover:opacity-90',
  },
  success: {
    wrapper: 'border-[var(--green-200)] bg-[var(--green-soft)] text-[var(--navy)]',
    icon: <CheckCircle2 className="h-5 w-5 text-[var(--green-700)]" />,
    cta: 'bg-[var(--green-600)] text-white hover:opacity-90',
  },
  warning: {
    wrapper: 'border-warning/30 bg-warning/10 text-[var(--navy)]',
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    cta: 'bg-warning text-white hover:opacity-90',
  },
  promo: {
    wrapper: 'border-gold/40 bg-gold-soft text-[var(--navy)]',
    icon: <Megaphone className="h-5 w-5 text-gold-dark" />,
    cta: 'bg-gold text-[var(--navy)] hover:bg-gold-dark',
  },
};

const DISMISSED_KEY = 'saghf-dismissed-banners';

/**
 * Announcement strip at the very top of the home page. Content, colour,
 * schedule and the on/off switch all come from the admin panel; nothing here
 * is hardcoded except the styling of each variant.
 */
export function AnnouncementBanner({ banners }: { banners: BannerDto[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DISMISSED_KEY);
      setDismissed(stored ? (JSON.parse(stored) as string[]) : []);
    } catch {
      setDismissed([]);
    }
    setReady(true);
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next.slice(-20)));
    } catch {
      /* storage unavailable — the banner simply reappears next visit */
    }
  };

  const visible = ready ? banners.filter((banner) => !dismissed.includes(banner.id)) : banners;
  if (visible.length === 0) return null;

  return (
    <div className="container border-none my-4 w-full">
      <div className="space-y-3">
        {visible.map((banner) => {
          const style = VARIANTS[banner.variant] ?? VARIANTS.info;
          return (
            <div
              key={banner.id}
              role="status"
              className={cn(
                'flex flex-col gap-3 rounded-[var(--radius-md)] border px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5',
                style.wrapper,
              )}
            >
              <span className="flex items-center gap-2">
                <span className="shrink-0">{style.icon}</span>
                <span className="text-[15px] font-bold sm:hidden">{banner.title}</span>
              </span>

              <div className="min-w-0 flex-1">
                <p className="hidden text-[15px] font-bold sm:block">{banner.title}</p>
                {banner.message && (
                  <p className="text-sm leading-7 opacity-90">{banner.message}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {banner.linkUrl && (
                  <Link
                    href={banner.linkUrl}
                    className={cn(
                      'inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-sm)] px-4 text-sm font-medium transition-opacity',
                      style.cta,
                    )}
                  >
                    {banner.ctaLabel || 'مشاهده'}
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                )}

                {banner.dismissible && (
                  <button
                    type="button"
                    onClick={() => dismiss(banner.id)}
                    aria-label="بستن اعلان"
                    className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
