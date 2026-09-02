'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';

import type { AdminPropertyDto } from '@saghf/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { ErrorState, Skeleton } from '@/components/ui/states';

import { useAdminProperties, useAdminPropertyAction } from '@/lib/hooks';

import {
  formatJalali,
  formatMobile,
  formatNumber,
  formatTomanShort,
  toPersianDigits,
} from '@/lib/format';

const STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'PENDING', label: 'در انتظار بررسی' },
  { value: 'PUBLISHED', label: 'منتشر شده' },
  { value: 'REJECTED', label: 'رد شده' },
  { value: 'EXPIRED', label: 'پایان یافته' },
  { value: 'INACTIVE', label: 'غیرفعال' },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
  PUBLISHED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  EXPIRED: 'muted',
  INACTIVE: 'muted',
  DRAFT: 'muted',
};

export default function AdminPropertiesPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [rejecting, setRejecting] = useState<AdminPropertyDto | null>(null);

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const [deleting, setDeleting] = useState<AdminPropertyDto | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdminProperties({
    status: status || undefined,
    q: search || undefined,
    page,
  });

  const action = useAdminPropertyAction();

  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================== */}

      <div
        className="
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-xl
              font-bold
              text-[var(--navy)]

              sm:text-2xl
            "
          >
            مدیریت آگهی‌ها
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-[var(--text-secondary)]
            "
          >
            بررسی، تأیید و مدیریت آگهی‌های ثبت‌شده
          </p>
        </div>

        <div
          className="
            flex
            max-w-xl
            items-start
            gap-2.5

            rounded-[var(--radius-md)]
            border
            border-[var(--green-200)]
            bg-[var(--green-soft)]

            px-3.5
            py-3

            text-xs
            leading-6
            text-[var(--green-700)]

            sm:text-sm
          "
        >
          <ShieldCheck
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
            "
            strokeWidth={1.9}
          />

          <span>
            شماره تماس مالک فقط در این پنل نمایش داده می‌شود و هرگز روی سایت عمومی منتشر نمی‌شود.
          </span>
        </div>
      </div>

      {/* =========================
          Search & Filters
      ========================== */}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(q.trim());
        }}
        className="
          grid
          gap-3

          rounded-[var(--radius-lg)]
          border
          border-[var(--line)]
          bg-white

          p-4

          shadow-[var(--shadow-sm)]

          sm:grid-cols-[minmax(0,1fr)_200px_auto]
          sm:items-center
        "
      >
        <div className="relative min-w-0">
          <Search
            className="
              pointer-events-none
              absolute
              right-4
              top-1/2
              h-[18px]
              w-[18px]
              -translate-y-1/2
              text-[var(--green-600)]
            "
            strokeWidth={1.8}
          />

          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="عنوان، کد آگهی یا شماره مالک"
            className="pr-11"
            aria-label="جستجوی آگهی"
          />
        </div>

        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="w-full"
          aria-label="فیلتر وضعیت"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Button
          type="submit"
          className="
            w-full
            sm:w-auto
          "
        >
          <Search className="h-4 w-4" />
          جستجو
        </Button>
      </form>

      {/* Error */}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />}

      {/* Loading */}
      {isLoading && (
        <>
          <div className="hidden md:block">
            <Skeleton className="h-96 w-full" />
          </div>

          <div className="grid gap-3 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        </>
      )}

      {data && (
        <>
          {/* =========================
              Desktop / Tablet Table
          ========================== */}

          <div
            className="
              hidden
              overflow-hidden

              rounded-[var(--radius-lg)]
              border
              border-[var(--line)]
              bg-white

              shadow-[var(--shadow-card)]

              md:block
            "
          >
            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[920px]
                  text-start
                  text-sm
                "
              >
                <thead
                  className="
                    border-b
                    border-[var(--line)]
                    bg-[var(--background-soft)]
                    text-[var(--navy)]
                  "
                >
                  <tr>
                    <Th>آگهی</Th>
                    <Th>مالک</Th>
                    <Th>قیمت</Th>
                    <Th>وضعیت</Th>
                    <Th>تاریخ ثبت</Th>
                    <Th>عملیات</Th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-[var(--line-soft)]
                  "
                >
                  {data.items.map((property) => (
                    <tr
                      key={property.id}
                      className="
                        align-top
                        transition-colors
                        hover:bg-[var(--green-50)]
                      "
                    >
                      {/* Property */}
                      <Td>
                        <p
                          className="
                            max-w-[240px]
                            truncate
                            font-semibold
                            text-[var(--navy)]
                          "
                        >
                          {property.title}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[var(--text-secondary)]
                          "
                        >
                          {property.city}، {property.neighborhood}
                          {' — '}
                          <span className="num">{formatNumber(property.area)}</span> متر
                        </p>

                        {property.status === 'PUBLISHED' && (
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="
                              mt-1.5
                              inline-flex
                              text-xs
                              font-medium
                              text-[var(--green-700)]
                              underline
                              decoration-[var(--green-300)]
                              underline-offset-4

                              hover:text-[var(--navy)]
                            "
                          >
                            مشاهده در سایت
                          </Link>
                        )}
                      </Td>

                      {/* Owner */}
                      <Td>
                        <p className="font-medium text-[var(--navy)]">
                          {property.ownerName ?? '—'}
                        </p>

                        <p
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-[var(--text-secondary)]
                          "
                        >
                          <Phone
                            className="
                              h-3.5
                              w-3.5
                              text-[var(--green-600)]
                            "
                          />

                          <a
                            dir="ltr"
                            href={`tel:${property.ownerPhone}`}
                            className="
                              transition-colors
                              hover:text-[var(--green-700)]
                            "
                          >
                            {formatMobile(property.ownerPhone)}
                          </a>
                        </p>
                      </Td>

                      {/* Price */}
                      <Td>
                        <span
                          className="
                            num
                            font-semibold
                            text-[var(--navy)]
                          "
                        >
                          {property.price
                            ? formatTomanShort(property.price)
                            : `${formatTomanShort(property.deposit)} / ${formatTomanShort(
                                property.monthlyRent,
                              )}`}
                        </span>
                      </Td>

                      {/* Status */}
                      <Td>
                        <div className="flex flex-col items-start gap-1.5">
                          <Badge tone={STATUS_TONE[property.status] ?? 'muted'}>
                            {STATUS_OPTIONS.find((option) => option.value === property.status)
                              ?.label ?? property.status}
                          </Badge>

                          {property.isFeatured && <Badge tone="accent">ویژه</Badge>}
                        </div>
                      </Td>

                      {/* Date */}
                      <Td>
                        <span
                          className="
                            num
                            whitespace-nowrap
                            text-[var(--text-secondary)]
                          "
                        >
                          {formatJalali(property.createdAt)}
                        </span>
                      </Td>

                      {/* Actions */}
                      <Td>
                        <PropertyActions
                          property={property}
                          onApprove={() =>
                            action.mutate({
                              id: property.id,
                              action: 'approve',
                            })
                          }
                          onReject={() => setRejecting(property)}
                          onFeature={() =>
                            action.mutate({
                              id: property.id,
                              action: 'feature',
                              payload: {
                                featured: !property.isFeatured,
                              },
                            })
                          }
                          onExpire={() =>
                            action.mutate({
                              id: property.id,
                              action: 'expire',
                            })
                          }
                          onDelete={() => setDeleting(property)}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.items.length === 0 && (
              <div
                className="
                  px-6
                  py-14
                  text-center
                "
              >
                <Search
                  className="
                    mx-auto
                    mb-3
                    h-7
                    w-7
                    text-[var(--green-600)]
                  "
                />

                <p className="text-sm text-[var(--text-secondary)]">
                  آگهی‌ای با این مشخصات پیدا نشد.
                </p>
              </div>
            )}
          </div>

          {/* =========================
              Mobile Cards
          ========================== */}

          <div className="grid gap-3 md:hidden">
            {data.items.map((property) => (
              <article
                key={property.id}
                className="
                  overflow-hidden
                  rounded-[var(--radius-lg)]
                  border
                  border-[var(--line)]
                  bg-white
                  shadow-[var(--shadow-sm)]
                "
              >
                {/* Mobile card header */}
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3

                    border-b
                    border-[var(--line-soft)]

                    p-4
                  "
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        line-clamp-2
                        text-[15px]
                        font-semibold
                        leading-7
                        text-[var(--navy)]
                      "
                    >
                      {property.title}
                    </p>

                    <p
                      className="
                        mt-1
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-[var(--text-secondary)]
                      "
                    >
                      <MapPin
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-[var(--green-600)]
                        "
                      />
                      {property.city}، {property.neighborhood}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      shrink-0
                      flex-col
                      items-end
                      gap-1.5
                    "
                  >
                    <Badge tone={STATUS_TONE[property.status] ?? 'muted'}>
                      {STATUS_OPTIONS.find((option) => option.value === property.status)?.label ??
                        property.status}
                    </Badge>

                    {property.isFeatured && <Badge tone="accent">ویژه</Badge>}
                  </div>
                </div>

                {/* Mobile card information */}
                <div className="space-y-4 p-4">
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <MobileInfo label="متراژ" value={`${formatNumber(property.area)} متر`} />

                    <MobileInfo label="تاریخ ثبت" value={formatJalali(property.createdAt,'numeric')} />

                    <MobileInfo label="مالک" value={property.ownerName ?? '—'} />

                    <div>
                      <p
                        className="
                          text-[11px]
                          text-[var(--text-muted)]
                        "
                      >
                        شماره مالک
                      </p>

                      <a
                        dir="ltr"
                        href={`tel:${property.ownerPhone}`}
                        className="
                          mt-1
                          flex
                          items-center
                          justify-end
                          gap-1.5
                          text-sm
                          font-medium
                          text-[var(--green-700)]
                        "
                      >
                        <Phone className="h-3.5 w-3.5" />

                        {formatMobile(property.ownerPhone)}
                      </a>
                    </div>
                  </div>

                  {/* Price */}
                  <div
                    className="
                      rounded-[var(--radius-sm)]
                      bg-[var(--background-soft)]
                      px-3.5
                      py-3
                    "
                  >
                    <p
                      className="
                        text-[11px]
                        text-[var(--text-muted)]
                      "
                    >
                      قیمت
                    </p>

                    <p
                      className="
                        num
                        mt-1
                        text-[15px]
                        font-bold
                        text-[var(--navy)]
                      "
                    >
                      {property.price
                        ? formatTomanShort(property.price)
                        : `${formatTomanShort(property.deposit)} / ${formatTomanShort(
                            property.monthlyRent,
                          )}`}
                    </p>
                  </div>

                  {property.status === 'PUBLISHED' && (
                    <Link
                      href={`/properties/${property.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        text-sm
                        font-medium
                        text-[var(--green-700)]
                        underline
                        decoration-[var(--green-300)]
                        underline-offset-4
                      "
                    >
                      مشاهده آگهی در سایت
                    </Link>
                  )}

                  {/* Mobile actions */}
                  <div
                    className="
                      border-t
                      border-[var(--line-soft)]
                      pt-3
                    "
                  >
                    <PropertyActions
                      property={property}
                      mobile
                      onApprove={() =>
                        action.mutate({
                          id: property.id,
                          action: 'approve',
                        })
                      }
                      onReject={() => setRejecting(property)}
                      onFeature={() =>
                        action.mutate({
                          id: property.id,
                          action: 'feature',
                          payload: {
                            featured: !property.isFeatured,
                          },
                        })
                      }
                      onExpire={() =>
                        action.mutate({
                          id: property.id,
                          action: 'expire',
                        })
                      }
                      onDelete={() => setDeleting(property)}
                    />
                  </div>
                </div>
              </article>
            ))}

            {data.items.length === 0 && (
              <div
                className="
                  rounded-[var(--radius-lg)]
                  border
                  border-[var(--line)]
                  bg-white
                  px-6
                  py-12
                  text-center
                "
              >
                <Search
                  className="
                    mx-auto
                    mb-3
                    h-7
                    w-7
                    text-[var(--green-600)]
                  "
                />

                <p className="text-sm text-[var(--text-secondary)]">
                  آگهی‌ای با این مشخصات پیدا نشد.
                </p>
              </div>
            )}
          </div>

          {/* =========================
              Pagination
          ========================== */}

          {data.totalPages > 1 && (
            <div
              className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-2
                sm:gap-3
              "
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                قبلی
              </Button>

              <span
                className="
                  num
                  min-w-[110px]
                  text-center
                  text-xs
                  text-[var(--text-secondary)]

                  sm:text-sm
                "
              >
                صفحه {toPersianDigits(data.page)} از {toPersianDigits(data.totalPages)}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                بعدی
              </Button>
            </div>
          )}
        </>
      )}

      {/* =========================
          Reject Modal
      ========================== */}

      <Modal
        open={Boolean(rejecting)}
        onClose={() => {
          setRejecting(null);
          setReason('');
          setReasonError(undefined);
        }}
        title="رد آگهی"
        footer={
          <>
            <Button
              variant="danger"
              loading={action.isPending}
              className="w-full sm:w-auto"
              onClick={() => {
                if (reason.trim().length < 5) {
                  setReasonError('دلیل رد آگهی را کامل بنویسید (حداقل ۵ کاراکتر).');
                  return;
                }

                if (rejecting) {
                  action.mutate({
                    id: rejecting.id,
                    action: 'reject',
                    payload: {
                      reason: reason.trim(),
                    },
                  });
                }

                setRejecting(null);
                setReason('');
              }}
            >
              ثبت رد آگهی
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setRejecting(null)}
            >
              انصراف
            </Button>
          </>
        }
      >
        <p
          className="
            mb-4
            text-[15px]
            leading-7
            text-[var(--text-secondary)]
          "
        >
          دلیل رد آگهی «{rejecting?.title}» برای مالک ارسال می‌شود.
        </p>

        <Label htmlFor="reject-reason" required>
          دلیل رد
        </Label>

        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError(undefined);
          }}
          invalid={Boolean(reasonError)}
          placeholder="مثلاً: تصاویر با مشخصات ملک مطابقت ندارد."
        />

        <FieldError message={reasonError} />
      </Modal>

      {/* =========================
          Delete Modal
      ========================== */}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="حذف آگهی"
        footer={
          <>
            <Button
              variant="danger"
              loading={action.isPending}
              className="w-full sm:w-auto"
              onClick={() => {
                if (deleting) {
                  action.mutate({
                    id: deleting.id,
                    action: 'delete',
                  });
                }

                setDeleting(null);
              }}
            >
              حذف کن
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setDeleting(null)}
            >
              انصراف
            </Button>
          </>
        }
      >
        <p
          className="
            text-[15px]
            leading-8
            text-[var(--text-secondary)]
          "
        >
          آگهی «{deleting?.title}» از سایت حذف می‌شود. این عملیات قابل بازگشت نیست.
        </p>
      </Modal>
    </div>
  );
}

/* =========================================================
   Property Actions
========================================================= */

function PropertyActions({
  property,
  mobile = false,
  onApprove,
  onReject,
  onFeature,
  onExpire,
  onDelete,
}: {
  property: AdminPropertyDto;
  mobile?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onFeature: () => void;
  onExpire: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={
        mobile
          ? `
            grid
            grid-cols-3
            gap-2

            sm:grid-cols-6
          `
          : `
            flex
            flex-wrap
            gap-1.5
          `
      }
    >
      <IconAction
        label="ویرایش آگهی"
        href={`/admin/properties/${property.id}/edit`}
        mobile={mobile}
      >
        <Pencil className="h-4 w-4" />
      </IconAction>

      {property.status !== 'PUBLISHED' && (
        <IconAction label="تأیید و انتشار" tone="success" onClick={onApprove} mobile={mobile}>
          <Check className="h-4 w-4" />
        </IconAction>
      )}

      {property.status !== 'REJECTED' && (
        <IconAction label="رد آگهی" tone="danger" onClick={onReject} mobile={mobile}>
          <X className="h-4 w-4" />
        </IconAction>
      )}

      <IconAction
        label={property.isFeatured ? 'حذف از ویژه' : 'ویژه کردن'}
        tone={property.isFeatured ? 'accent' : 'default'}
        onClick={onFeature}
        mobile={mobile}
      >
        <Star className={property.isFeatured ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
      </IconAction>

      <IconAction label="پایان دادن" onClick={onExpire} mobile={mobile}>
        <Clock className="h-4 w-4" />
      </IconAction>

      <IconAction label="حذف" tone="danger" onClick={onDelete} mobile={mobile}>
        <Trash2 className="h-4 w-4" />
      </IconAction>
    </div>
  );
}

/* =========================================================
   Icon action
========================================================= */

function IconAction({
  label,
  onClick,
  href,
  tone = 'default',
  mobile = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  /** When set the action renders as a link instead of a button. */
  href?: string;
  tone?: 'default' | 'success' | 'danger' | 'accent';
  mobile?: boolean;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'success'
      ? `
        border-[var(--green-200)]
        text-[var(--green-700)]

        hover:bg-[var(--green-soft)]
      `
      : tone === 'danger'
        ? `
          border-[rgba(196,73,73,0.18)]
          text-[var(--danger)]

          hover:bg-[var(--danger-soft)]
        `
        : tone === 'accent'
          ? `
            border-[var(--green-200)]
            bg-[var(--green-soft)]
            text-[var(--green-700)]

            hover:bg-[var(--green-100)]
          `
          : `
            border-[var(--line)]
            text-[var(--text-secondary)]

            hover:border-[var(--green-200)]
            hover:bg-[var(--green-50)]
            hover:text-[var(--navy)]
          `;

  const className = `
    flex
    items-center
    justify-center

    rounded-[var(--radius-sm)]
    border
    bg-white

    transition-all
    duration-200

    ${mobile ? 'h-11 w-full' : 'h-9 w-9'}

    ${toneClass}
  `;

  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={className}>
      {children}
    </button>
  );
}

/* =========================================================
   Mobile info
========================================================= */

function MobileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="
          text-[11px]
          text-[var(--text-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          num
          mt-1
          text-sm
          font-medium
          text-[var(--navy)]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   Table
========================================================= */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3.5
        text-start
        text-sm
        font-bold
      "
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={`
        px-4
        py-4
        ${className ?? ''}
      `}
    >
      {children}
    </td>
  );
}
