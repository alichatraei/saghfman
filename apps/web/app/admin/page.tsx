'use client';

import Link from 'next/link';
import { Building2, Clock, Users, TrendingUp, XCircle, ArrowLeft } from 'lucide-react';

import { useAdminDashboard } from '@/lib/hooks';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { Badge } from '@/components/ui/badge';

import { formatJalali, formatMobile, formatNumber, toPersianDigits } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const maxViews = Math.max(...data.viewsLast7Days.map((item) => item.count), 1);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-[var(--navy)]
          "
        >
          داشبورد
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-[var(--text-secondary)]
          "
        >
          نمای کلی وضعیت آگهی‌ها و فعالیت کاربران
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="آگهی‌های منتشر شده"
          value={data.publishedProperties}
        />

        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="در انتظار بررسی"
          value={data.pendingProperties}
          tone="warning"
        />

        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="رد شده"
          value={data.rejectedProperties}
          tone="danger"
        />

        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="کاربران"
          value={data.users}
          tone="navy"
        />
      </div>

      {/* Analytics */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Views chart */}
        <section
          className="
            rounded-[var(--radius-lg)]
            border
            border-[var(--line)]
            bg-white
            p-6
            shadow-[var(--shadow-card)]
          "
        >
          <div>
            <h2
              className="
                accent-underline
                text-lg
                font-bold
                text-[var(--navy)]
              "
            >
              بازدید ۷ روز اخیر
            </h2>

            <p
              className="
                mt-3
                text-sm
                text-[var(--text-muted)]
              "
            >
              تعداد بازدید آگهی‌ها در هفت روز گذشته
            </p>
          </div>

          <ul
            className="
              mt-8
              flex
              h-52
              items-end
              gap-2
              sm:gap-3
            "
          >
            {data.viewsLast7Days.map((item) => {
              const height = Math.max(6, (item.count / maxViews) * 100);

              return (
                <li
                  key={item.date}
                  className="
                      group
                      flex
                      h-full
                      flex-1
                      flex-col
                      items-center
                      justify-end
                      gap-2
                    "
                >
                  <span
                    className="
                        num
                        text-xs
                        font-medium
                        text-[var(--text-secondary)]
                      "
                  >
                    {toPersianDigits(item.count)}
                  </span>

                  <div
                    className="
                        relative
                        flex
                        h-[150px]
                        w-full
                        max-w-12
                        items-end
                        overflow-hidden
                        rounded-t-[8px]
                        bg-[var(--green-50)]
                      "
                    aria-hidden
                  >
                    <div
                      className="
                          w-full
                          rounded-t-[8px]
                          bg-[var(--green)]
                          transition-all
                          duration-300

                          group-hover:bg-[var(--green-600)]
                        "
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <span
                    className="
                        num
                        text-[11px]
                        text-[var(--text-muted)]
                      "
                  >
                    {formatJalali(item.date).slice(-5)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Quick stats */}
        <section
          className="
            rounded-[var(--radius-lg)]
            border
            border-[var(--line)]
            bg-white
            p-6
            shadow-[var(--shadow-card)]
          "
        >
          <h2
            className="
              accent-underline
              text-lg
              font-bold
              text-[var(--navy)]
            "
          >
            یک نگاه
          </h2>

          <dl className="mt-6 space-y-3 text-sm">
            <Row label="آگهی ثبت‌شده امروز" value={formatNumber(data.propertiesToday)} />

            <Row label="مجموع علاقه‌مندی‌ها" value={formatNumber(data.favorites)} />

            <Row
              label="نرخ تأیید"
              value={`${toPersianDigits(
                Math.round(
                  (data.publishedProperties /
                    Math.max(1, data.publishedProperties + data.rejectedProperties)) *
                    100,
                ),
              )}٪`}
            />
          </dl>

          <div
            className="
              mt-5
              flex
              items-start
              gap-2.5
              rounded-[var(--radius-sm)]
              border
              border-[var(--green-200)]
              bg-[var(--green-soft)]
              p-3
              text-sm
              leading-6
              text-[var(--green-700)]
            "
          >
            <TrendingUp
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
              "
              strokeWidth={2}
            />

            <span>آگهی‌های در انتظار را زودتر بررسی کنید.</span>
          </div>
        </section>
      </div>

      {/* Pending properties */}
      <section
        className="
          overflow-hidden
          rounded-[var(--radius-lg)]
          border
          border-[var(--line)]
          bg-white
          shadow-[var(--shadow-card)]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-[var(--line)]
            px-5
            py-4
            sm:px-6
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-[var(--navy)]
              "
            >
              آخرین آگهی‌های در انتظار بررسی
            </h2>

            <p
              className="
                mt-1
                hidden
                text-xs
                text-[var(--text-muted)]
                sm:block
              "
            >
              آگهی‌هایی که هنوز توسط کارشناسان بررسی نشده‌اند
            </p>
          </div>

          <Link
            href="/admin/properties?status=PENDING"
            className="
              group
              flex
              shrink-0
              items-center
              gap-1.5
              text-sm
              font-medium
              text-[var(--green-700)]
              transition-colors

              hover:text-[var(--navy)]
            "
          >
            مشاهده همه
            <ArrowLeft
              className="
                h-4
                w-4
                transition-transform
                group-hover:-translate-x-0.5
              "
              strokeWidth={1.8}
            />
          </Link>
        </div>

        {data.recentPending.length === 0 ? (
          <div
            className="
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
              <Building2 className="h-5 w-5" strokeWidth={1.8} />
            </span>

            <p
              className="
                text-sm
                text-[var(--text-secondary)]
              "
            >
              آگهی در انتظار بررسی وجود ندارد.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {data.recentPending.map((property) => (
              <li
                key={property.id}
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-4
                    transition-colors

                    hover:bg-[var(--background-soft)]

                    sm:px-6
                  "
              >
                <div className="min-w-0">
                  <p
                    className="
                        truncate
                        font-semibold
                        text-[var(--navy)]
                      "
                  >
                    {property.title}
                  </p>

                  <p
                    className="
                        num
                        mt-1
                        text-sm
                        leading-6
                        text-[var(--text-secondary)]
                      "
                  >
                    {property.city}، {property.neighborhood}
                    {' — '}
                    مالک: {property.ownerName ?? '—'} ({formatMobile(property.ownerPhone)})
                  </p>
                </div>

                <div
                  className="
                      flex
                      shrink-0
                      items-center
                      gap-3
                    "
                >
                  <Badge tone="warning">در انتظار بررسی</Badge>

                  <Link
                    href="/admin/properties?status=PENDING"
                    className="
                        flex
                        h-10
                        items-center
                        justify-center
                        rounded-[var(--radius-sm)]
                        border
                        border-[var(--line)]
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-[var(--navy)]
                        transition-all

                        hover:border-[var(--green-300)]
                        hover:bg-[var(--green-50)]
                      "
                  >
                    بررسی
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = 'navy',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: 'navy' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'warning'
      ? `
        border-[rgba(211,139,50,0.18)]
        bg-[var(--warning-soft)]
        text-[var(--warning)]
      `
      : tone === 'danger'
        ? `
          border-[rgba(196,73,73,0.18)]
          bg-[var(--danger-soft)]
          text-[var(--danger)]
        `
        : `
          border-[var(--green-200)]
          bg-[var(--green-soft)]
          text-[var(--green-700)]
        `;

  return (
    <div
      className="
        group
        flex
        items-center
        gap-4
        rounded-[var(--radius-lg)]
        border
        border-[var(--line)]
        bg-white
        p-5
        shadow-[var(--shadow-sm)]
        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:shadow-[var(--shadow-card)]
      "
    >
      <span
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-[var(--radius-md)]
          border
          transition-transform
          duration-300

          group-hover:scale-105

          ${toneClass}
        `}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p
          className="
            truncate
            text-sm
            text-[var(--text-secondary)]
          "
        >
          {label}
        </p>

        <p
          className="
            num
            mt-0.5
            text-2xl
            font-bold
            text-[var(--navy)]
          "
        >
          {formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-[var(--line-soft)]
        pb-3
        last:border-0
      "
    >
      <dt className="text-[var(--text-secondary)]">{label}</dt>

      <dd
        className="
          num
          font-bold
          text-[var(--navy)]
        "
      >
        {value}
      </dd>
    </div>
  );
}
