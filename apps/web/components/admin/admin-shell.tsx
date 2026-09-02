'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  ArrowUpLeft,
  Building2,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { isStaff, useAuthStore } from '@/lib/auth-store';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/states';

const ITEMS = [
  {
    href: '/admin',
    label: 'داشبورد',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/properties',
    label: 'مدیریت آگهی‌ها',
    icon: Building2,
  },
  {
    href: '/admin/users',
    label: 'کاربران',
    icon: Users,
  },
  {
    href: '/admin/banners',
    label: 'بنر صفحه اصلی',
    icon: Megaphone,
  },
  {
    href: '/admin/settings/contact',
    label: 'تنظیمات تماس',
    icon: Settings,
  },
];

/**
 * Admin chrome — deliberately separate from the public site shell.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    const timer = setTimeout(() => {
      const state = useAuthStore.getState();

      if (!state.accessToken || !isStaff(state.user?.role)) {
        router.replace('/auth?next=/admin');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [router]);

  const logout = async () => {
    await apiFetch('/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);

    clear();
    router.push('/');
  };

  if (!user || !isStaff(user.role)) {
    return (
      <div
        className="
          mx-auto
          max-w-3xl
          space-y-4
          p-8
        "
      >
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div
      className="
        flex
        min-h-screen
        bg-[var(--background)]
      "
    >
      {/* =========================
          Desktop Sidebar
      ========================== */}

      <aside
        className="
          sticky
          top-0
          hidden
          h-screen
          w-64
          shrink-0
          flex-col
          border-l
          border-white/[0.06]
          bg-[var(--navy)]
          p-5
          text-white
          shadow-[8px_0_35px_rgba(6,31,44,0.08)]
          lg:flex
        "
      >
        {/* Brand */}
        <Link
          href="/admin"
          className="
            mb-8
            flex
            items-center
            gap-3
            rounded-[var(--radius-md)]
            px-1
            text-lg
            font-bold
            text-white
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[var(--radius-sm)]
              bg-[var(--green)]
              font-bold
              text-[var(--navy)]
              shadow-[0_6px_18px_rgba(65,181,140,0.16)]
            "
          >
            س
          </span>

          <span>پنل مدیریت سقف من</span>
        </Link>

        {/* Navigation */}
        <nav aria-label="ناوبری پنل مدیریت" className="flex-1">
          <ul className="space-y-1.5">
            {ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <li key={item.href}>
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
                        gap-3
                        overflow-hidden
                        rounded-[var(--radius-sm)]
                        px-4
                        text-[15px]
                        transition-all
                        duration-200
                      `,
                      active
                        ? `
                          bg-[rgba(65,181,140,0.14)]
                          font-semibold
                          text-[var(--green-300)]
                        `
                        : `
                          text-white/70
                          hover:bg-white/[0.06]
                          hover:text-white
                        `,
                    )}
                  >
                    {/* Active bar */}
                    <span
                      aria-hidden
                      className={cn(
                        `
                          absolute
                          right-0
                          top-1/2
                          h-6
                          w-[3px]
                          -translate-y-1/2
                          rounded-l-full
                          bg-[var(--green)]
                          transition-opacity
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
                        `,
                        active
                          ? 'text-[var(--green-300)]'
                          : `
                            text-white/50
                            group-hover:text-[var(--green-300)]
                          `,
                      )}
                    />

                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div
          className="
            space-y-1
            border-t
            border-white/10
            pt-4
            text-sm
          "
        >
          <div
            className="
              mb-2
              rounded-[var(--radius-sm)]
              bg-white/[0.04]
              px-4
              py-3
            "
          >
            <p className="text-xs text-white/45">وارد شده به عنوان</p>

            <p className="mt-1 font-medium text-white/90">{user.fullName ?? 'کارشناس'}</p>
          </div>

          <Link
            href="/"
            className="
              group
              flex
              min-h-[44px]
              items-center
              gap-2.5
              rounded-[var(--radius-sm)]
              px-4
              text-white/70
              transition-colors

              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <ArrowUpLeft
              className="
                h-4
                w-4
                text-white/45
                transition-colors
                group-hover:text-[var(--green-300)]
              "
              strokeWidth={1.8}
            />
            بازگشت به سایت
          </Link>

          <button
            type="button"
            onClick={logout}
            className="
              flex
              min-h-[44px]
              w-full
              items-center
              gap-2.5
              rounded-[var(--radius-sm)]
              px-4
              text-[var(--danger-soft)]
              transition-colors

              hover:bg-[rgba(196,73,73,0.12)]
              hover:text-white
            "
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            خروج
          </button>
        </div>
      </aside>

      {/* =========================
          Content
      ========================== */}

      <div className="min-w-0 flex-1">
        {/* Mobile Navigation */}
        <header
          className="
            sticky
            top-0
            z-30
            border-b
            border-[var(--line)]
            bg-white/95
            backdrop-blur-xl
            lg:hidden
          "
        >
          <div
            className="
              hide-scrollbar
              flex
              items-center
              gap-2
              overflow-x-auto
              px-4
              py-3
            "
          >
            {ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    `
                      flex
                      min-h-[42px]
                      shrink-0
                      items-center
                      gap-2
                      whitespace-nowrap
                      rounded-[var(--radius-sm)]
                      border
                      px-3.5
                      py-2
                      text-sm
                      transition-all
                      duration-200
                    `,
                    active
                      ? `
                        border-[var(--green-200)]
                        bg-[var(--green-soft)]
                        font-semibold
                        text-[var(--navy)]
                      `
                      : `
                        border-transparent
                        bg-transparent
                        text-[var(--text-secondary)]

                        hover:border-[var(--line)]
                        hover:bg-[var(--background-soft)]
                        hover:text-[var(--navy)]
                      `,
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      active ? 'text-[var(--green-700)]' : 'text-[var(--text-muted)]',
                    )}
                    strokeWidth={1.8}
                  />

                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Main Content */}
        <main
          className="
            min-h-screen
            p-4
            sm:p-6
            lg:p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
