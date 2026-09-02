'use client';

import { useState } from 'react';
import {
  Ban,
  CalendarDays,
  FileText,
  Phone,
  Search,
  ShieldCheck,
  ShieldOff,
  UserRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { ErrorState, Skeleton } from '@/components/ui/states';

import { useAdminUsers, useAdminUserStatus } from '@/lib/hooks';

import { formatJalali, formatMobile, formatNumber, toPersianDigits } from '@/lib/format';

const STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'ACTIVE', label: 'فعال' },
  { value: 'SUSPENDED', label: 'تعلیق‌شده' },
  { value: 'BLOCKED', label: 'مسدود' },
];

const ROLE_LABELS: Record<string, string> = {
  USER: 'کاربر',
  EDITOR: 'ویرایشگر',
  MANAGER: 'مدیر بخش',
  ADMIN: 'مدیر کل',
};

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    q: search || undefined,
    status: status || undefined,
    page,
  });

  const updateStatus = useAdminUserStatus();

  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================== */}

      <div>
        <h1
          className="
            text-xl
            font-bold
            text-[var(--navy)]
            sm:text-2xl
          "
        >
          کاربران
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-[var(--text-secondary)]
          "
        >
          مدیریت کاربران، وضعیت حساب و سطح دسترسی
        </p>
      </div>

      {/* =========================
          Search & Filter
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

          sm:grid-cols-[minmax(0,1fr)_190px_auto]
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
            placeholder="نام یا شماره موبایل"
            className="pr-11"
            aria-label="جستجوی کاربر"
          />
        </div>

        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="w-full"
          aria-label="فیلتر وضعیت کاربر"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4" />
          جستجو
        </Button>
      </form>

      {/* =========================
          Error
      ========================== */}

      {isError && <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />}

      {/* =========================
          Loading
      ========================== */}

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
                  min-w-[900px]
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
                    <Th>کاربر</Th>
                    <Th>شماره موبایل</Th>
                    <Th>نقش</Th>
                    <Th>آگهی‌ها</Th>
                    <Th>عضویت</Th>
                    <Th>وضعیت</Th>
                    <Th>عملیات</Th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-[var(--line-soft)]
                  "
                >
                  {data.items.map((user) => (
                    <tr
                      key={user.id}
                      className="
                        transition-colors
                        hover:bg-[var(--green-50)]
                      "
                    >
                      {/* User */}
                      <Td>
                        <div className="flex items-center gap-3">
                          <span
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[var(--green-soft)]
                              text-[var(--green-700)]
                            "
                          >
                            <UserRound className="h-4 w-4" strokeWidth={1.8} />
                          </span>

                          <span
                            className="
                              max-w-[180px]
                              truncate
                              font-semibold
                              text-[var(--navy)]
                            "
                          >
                            {user.fullName ?? 'بدون نام'}
                          </span>
                        </div>
                      </Td>

                      {/* Phone */}
                      <Td>
                        <a
                          dir="ltr"
                          href={`tel:${user.phone}`}
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-[var(--text-secondary)]
                            transition-colors
                            hover:text-[var(--green-700)]
                          "
                        >
                          <Phone
                            className="
                              h-3.5
                              w-3.5
                              text-[var(--green-600)]
                            "
                          />

                          {formatMobile(user.phone)}
                        </a>
                      </Td>

                      {/* Role */}
                      <Td>
                        <RoleBadge role={user.role} />
                      </Td>

                      {/* Listings */}
                      <Td>
                        <span
                          className="
                            num
                            font-semibold
                            text-[var(--navy)]
                          "
                        >
                          {formatNumber(user.propertyCount)}
                        </span>
                      </Td>

                      {/* Joined */}
                      <Td>
                        <span
                          className="
                            num
                            whitespace-nowrap
                            text-[var(--text-secondary)]
                          "
                        >
                          {formatJalali(user.createdAt,"numeric")}
                        </span>
                      </Td>

                      {/* Status */}
                      <Td>
                        <Badge
                          tone={
                            user.status === 'ACTIVE'
                              ? 'success'
                              : user.status === 'SUSPENDED'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {STATUS_OPTIONS.find((option) => option.value === user.status)?.label ??
                            user.status}
                        </Badge>
                      </Td>

                      {/* Actions */}
                      <Td>
                        <UserActions
                          user={user}
                          pending={updateStatus.isPending}
                          onActive={() =>
                            updateStatus.mutate({
                              id: user.id,
                              status: 'ACTIVE',
                            })
                          }
                          onSuspend={() =>
                            updateStatus.mutate({
                              id: user.id,
                              status: 'SUSPENDED',
                            })
                          }
                          onBlock={() =>
                            updateStatus.mutate({
                              id: user.id,
                              status: 'BLOCKED',
                            })
                          }
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.items.length === 0 && <EmptyUsers />}
          </div>

          {/* =========================
              Mobile Cards
          ========================== */}

          <div className="grid gap-3 md:hidden">
            {data.items.map((user) => (
              <article
                key={user.id}
                className="
                  overflow-hidden
                  rounded-[var(--radius-lg)]
                  border
                  border-[var(--line)]
                  bg-white
                  shadow-[var(--shadow-sm)]
                "
              >
                {/* Header */}
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
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--green-soft)]
                        text-[var(--green-700)]
                      "
                    >
                      <UserRound className="h-5 w-5" strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-[15px]
                          font-semibold
                          text-[var(--navy)]
                        "
                      >
                        {user.fullName ?? 'بدون نام'}
                      </p>

                      <RoleBadge role={user.role} compact />
                    </div>
                  </div>

                  <Badge
                    tone={
                      user.status === 'ACTIVE'
                        ? 'success'
                        : user.status === 'SUSPENDED'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {STATUS_OPTIONS.find((option) => option.value === user.status)?.label ??
                      user.status}
                  </Badge>
                </div>

                {/* Information */}
                <div className="space-y-4 p-4">
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-4
                    "
                  >
                    <MobileInfo icon={<Phone className="h-4 w-4" />} label="شماره موبایل">
                      <a
                        dir="ltr"
                        href={`tel:${user.phone}`}
                        className="
                          text-[var(--green-700)]
                        "
                      >
                        {formatMobile(user.phone)}
                      </a>
                    </MobileInfo>

                    <MobileInfo icon={<FileText className="h-4 w-4" />} label="تعداد آگهی‌ها">
                      <span className="num">{formatNumber(user.propertyCount)}</span>
                    </MobileInfo>

                    <MobileInfo
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="تاریخ عضویت"
                      className="col-span-2"
                    >
                      <span className="num">{formatJalali(user.createdAt)}</span>
                    </MobileInfo>
                  </div>

                  {/* Actions */}
                  <div
                    className="
                      border-t
                      border-[var(--line-soft)]
                      pt-3
                    "
                  >
                    <UserActions
                      user={user}
                      mobile
                      pending={updateStatus.isPending}
                      onActive={() =>
                        updateStatus.mutate({
                          id: user.id,
                          status: 'ACTIVE',
                        })
                      }
                      onSuspend={() =>
                        updateStatus.mutate({
                          id: user.id,
                          status: 'SUSPENDED',
                        })
                      }
                      onBlock={() =>
                        updateStatus.mutate({
                          id: user.id,
                          status: 'BLOCKED',
                        })
                      }
                    />
                  </div>
                </div>
              </article>
            ))}

            {data.items.length === 0 && <EmptyUsers />}
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
    </div>
  );
}

/* =========================================================
   Actions
========================================================= */

function UserActions({
  user,
  mobile = false,
  pending,
  onActive,
  onSuspend,
  onBlock,
}: {
  user: {
    status: string;
  };
  mobile?: boolean;
  pending?: boolean;
  onActive: () => void;
  onSuspend: () => void;
  onBlock: () => void;
}) {
  return (
    <div className={mobile ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap gap-1.5'}>
      {user.status !== 'ACTIVE' && (
        <StatusAction
          label="فعال‌سازی"
          tone="success"
          mobile={mobile}
          disabled={pending}
          onClick={onActive}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      )}

      {user.status !== 'SUSPENDED' && (
        <StatusAction
          label="تعلیق"
          tone="warning"
          mobile={mobile}
          disabled={pending}
          onClick={onSuspend}
          icon={<ShieldOff className="h-4 w-4" />}
        />
      )}

      {user.status !== 'BLOCKED' && (
        <StatusAction
          label="مسدود"
          tone="danger"
          mobile={mobile}
          disabled={pending}
          onClick={onBlock}
          icon={<Ban className="h-4 w-4" />}
        />
      )}
    </div>
  );
}

function StatusAction({
  label,
  icon,
  tone,
  onClick,
  disabled,
  mobile,
}: {
  label: string;
  icon: React.ReactNode;
  tone: 'success' | 'warning' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  mobile?: boolean;
}) {
  const toneClass =
    tone === 'success'
      ? `
        border-[var(--green-200)]
        text-[var(--green-700)]
        hover:bg-[var(--green-soft)]
      `
      : tone === 'warning'
        ? `
          border-[rgba(211,139,50,0.25)]
          text-[var(--warning)]
          hover:bg-[var(--warning-soft)]
        `
        : `
          border-[rgba(196,73,73,0.22)]
          text-[var(--danger)]
          hover:bg-[var(--danger-soft)]
        `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        items-center
        justify-center
        gap-1.5

        rounded-[var(--radius-sm)]
        border
        bg-white

        text-xs
        font-medium

        transition-all
        duration-200

        disabled:pointer-events-none
        disabled:opacity-50

        ${mobile ? 'h-11 w-full px-2' : 'h-9 px-3'}

        ${toneClass}
      `}
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   Role
========================================================= */

function RoleBadge({ role, compact = false }: { role: string; compact?: boolean }) {
  const admin = role === 'ADMIN' || role === 'MANAGER';

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        font-medium

        ${compact ? 'mt-1 px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}

        ${
          admin
            ? `
              bg-[var(--green-soft)]
              text-[var(--green-700)]
            `
            : `
              bg-[var(--background-soft)]
              text-[var(--text-secondary)]
            `
        }
      `}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

/* =========================================================
   Mobile info
========================================================= */

function MobileInfo({
  icon,
  label,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className="
          flex
          items-center
          gap-1.5
          text-[11px]
          text-[var(--text-muted)]
        "
      >
        <span className="text-[var(--green-600)]">{icon}</span>

        {label}
      </p>

      <div
        className="
          mt-1
          text-sm
          font-medium
          text-[var(--navy)]
        "
      >
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   Empty state
========================================================= */

function EmptyUsers() {
  return (
    <div
      className="
        rounded-[var(--radius-lg)]
        bg-white
        px-6
        py-12
        text-center
      "
    >
      <span
        className="
          mx-auto
          mb-3
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-[var(--green-soft)]
          text-[var(--green-700)]
        "
      >
        <UserRound className="h-5 w-5" strokeWidth={1.8} />
      </span>

      <p
        className="
          text-sm
          text-[var(--text-secondary)]
        "
      >
        کاربری با این مشخصات پیدا نشد.
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
        font-bold
      "
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4">{children}</td>;
}
