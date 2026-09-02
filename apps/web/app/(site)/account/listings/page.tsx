'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Eye,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Trash2,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import type { MyPropertyDto } from '@saghf/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useMyProperties, usePropertyAction } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { formatJalali, formatNumber } from '@/lib/format';
import { priceBlock } from '@/components/property/property-card';

const TABS = [
  { value: '', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار بررسی' },
  { value: 'PUBLISHED', label: 'منتشر شده' },
  { value: 'REJECTED', label: 'رد شده' },
  { value: 'EXPIRED', label: 'پایان یافته' },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
  PUBLISHED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  EXPIRED: 'muted',
  INACTIVE: 'muted',
  DRAFT: 'muted',
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'منتشر شده',
  PENDING: 'در انتظار بررسی',
  REJECTED: 'رد شده',
  EXPIRED: 'پایان یافته',
  INACTIVE: 'غیرفعال',
  DRAFT: 'پیش‌نویس',
};

export default function MyListingsPage() {
  const [status, setStatus] = useState('');
  const [pendingDelete, setPendingDelete] = useState<MyPropertyDto | null>(null);
  const { data, isLoading, isError, error, refetch } = useMyProperties(status || undefined);
  const action = usePropertyAction();

  const summary = {
    total: data?.length ?? 0,
    published: data?.filter((item) => item.status === 'PUBLISHED').length ?? 0,
    pending: data?.filter((item) => item.status === 'PENDING').length ?? 0,
    views: data?.reduce((sum, item) => sum + item.viewCount, 0) ?? 0,
  };

  return (
    <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div
          className="hide-scrollbar mb-5 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatus(tab.value)}
              aria-pressed={status === tab.value}
              className={cn(
                `
      whitespace-nowrap
      rounded-[var(--radius-sm)]
      border
      px-4
      py-2.5
      text-sm
      transition-all
      duration-200
    `,
                status === tab.value
                  ? `
        border-[var(--green-200)]
        bg-[var(--green-soft)]
        font-semibold
        text-[var(--green-700)]
        shadow-[0_2px_8px_rgba(65,181,140,0.10)]
      `
                  : `
        border-[var(--line)]
        bg-white
        text-[var(--text-secondary)]

        hover:border-[var(--green-300)]
        hover:bg-[var(--green-50)]
        hover:text-[var(--navy)]
      `,
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isError && (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        )}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="آگهی‌ای در این بخش ندارید"
            description="اولین ملک خود را ثبت کنید تا پس از بررسی کارشناسان منتشر شود."
            actionLabel="ثبت آگهی جدید"
            actionHref="/submit-property"
          />
        )}

        <ul className="space-y-4">
          {data?.map((property) => {
            const price = priceBlock(property);
            return (
              <li key={property.id} className="surface overflow-hidden">
                <div className="flex flex-col gap-4 p-3 sm:flex-row sm:p-4">
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded bg-cream-soft sm:aspect-auto sm:h-32 sm:w-40 md:w-44">
                    {property.coverImage ? (
                      <Image
                        src={property.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 180px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted">
                        بدون تصویر
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="min-w-0 break-words text-[16px] font-bold text-brand sm:text-[17px]">
                        {property.status === 'PUBLISHED' ? (
                          <Link
                            href={`/properties/${property.slug}`}
                            className="hover:text-brand-alt"
                          >
                            {property.title}
                          </Link>
                        ) : (
                          property.title
                        )}
                      </h2>
                      <Badge tone={STATUS_TONE[property.status] ?? 'muted'}>
                        {STATUS_LABEL[property.status] ?? property.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted">
                      {property.city}، {property.neighborhood} —{' '}
                      <span className="num">{formatNumber(property.area)}</span> متر
                    </p>
                    <p className="num mt-2 font-bold text-brand">{price.value}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted sm:text-sm">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span className="num">{formatNumber(property.viewCount)}</span> بازدید
                      </span>
                      <span className="num">ثبت: {formatJalali(property.createdAt,"numeric")}</span>
                      {property.expiresAt && (
                        <span className="num">انقضا: {formatJalali(property.expiresAt,"numeric")}</span>
                      )}
                    </div>

                    {property.status === 'REJECTED' && property.rejectionReason && (
                      <p className="mt-3 flex items-start gap-2 rounded bg-danger/5 p-3 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {property.rejectionReason}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Link
                        href={`/account/listings/${property.id}/edit`}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-3 text-sm font-medium text-brand transition-colors hover:border-gold sm:w-auto sm:px-4"
                      >
                        <Pencil className="h-4 w-4" />
                        ویرایش
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        loading={action.isPending}
                        onClick={() => action.mutate({ id: property.id, action: 'renew' })}
                      >
                        <RefreshCw className="h-4 w-4" />
                        تمدید
                      </Button>
                      {property.status === 'INACTIVE' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => action.mutate({ id: property.id, action: 'activate' })}
                        >
                          <PlayCircle className="h-4 w-4" />
                          فعال‌سازی
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => action.mutate({ id: property.id, action: 'deactivate' })}
                        >
                          <PauseCircle className="h-4 w-4" />
                          غیرفعال
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(property)}
                        className="w-full text-danger sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="surface order-first h-fit p-4 sm:p-5 xl:sticky xl:top-28 xl:order-none">
        <h2 className="text-[15px] font-bold text-brand">خلاصه وضعیت</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4 xl:grid-cols-1 xl:gap-y-3">
          <SummaryRow label="کل آگهی‌ها" value={formatNumber(summary.total)} />
          <SummaryRow label="منتشر شده" value={formatNumber(summary.published)} />
          <SummaryRow label="در انتظار بررسی" value={formatNumber(summary.pending)} />
          <SummaryRow label="مجموع بازدید" value={formatNumber(summary.views)} />
        </dl>
        <Link
          href="/submit-property"
          className="mt-5 flex h-12 items-center justify-center rounded bg-gold font-medium text-brand transition-colors hover:bg-gold-dark"
        >
          ثبت آگهی جدید
        </Link>
      </aside>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="حذف آگهی"
        footer={
          <>
            <Button
              variant="danger"
              loading={action.isPending}
              onClick={() => {
                if (pendingDelete) action.mutate({ id: pendingDelete.id, action: 'delete' });
                setPendingDelete(null);
              }}
            >
              بله، حذف کن
            </Button>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              انصراف
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-8 text-muted">
          آگهی «{pendingDelete?.title}» حذف می‌شود و دیگر در سایت نمایش داده نخواهد شد. این کار قابل
          بازگشت نیست.
        </p>
      </Modal>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="num font-bold text-brand">{value}</dd>
    </div>
  );
}
