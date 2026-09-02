'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, User, X, LogOut, Heart, FileText, LayoutDashboard, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Logo } from './logo';
import { cn } from '@/lib/cn';
import { isStaff, useAuthStore } from '@/lib/auth-store';
import { apiFetch } from '@/lib/api';

const NAV = [
  { href: '/', label: 'خانه' },
  { href: '/properties', label: 'آگهی‌ها' },
  { href: '/submit-property', label: 'ثبت آگهی' },
  { href: '/account/favorites', label: 'علاقه‌مندی‌ها' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const logout = async () => {
    await apiFetch('/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);

    clear();
    router.push('/');
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-[var(--navy)]
        text-white
        shadow-[0_1px_0_rgba(255,255,255,0.06)]
      "
    >
      <div className="container flex h-16 items-center justify-between gap-4 sm:h-[88px]">
        {/* Logo */}
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  `
                    group
                    relative
                    flex h-[88px]
                    items-center
                    text-[15px]
                    transition-colors
                    duration-200
                  `,
                  active
                    ? 'font-semibold text-white'
                    : `
                      text-white/75
                      hover:text-white
                    `,
                )}
              >
                {item.label}

                {/* Active indicator */}
                <span
                  aria-hidden
                  className={cn(
                    `
                      absolute
                      bottom-0
                      right-1/2
                      h-[3px]
                      translate-x-1/2
                      rounded-full
                      bg-[var(--green)]
                      transition-all
                      duration-300
                    `,
                    active
                      ? 'w-8 opacity-100'
                      : `
                        w-0
                        opacity-0
                        group-hover:w-5
                        group-hover:opacity-70
                      `,
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            /* Logged-in desktop menu */
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="
                  flex h-12
                  items-center
                  gap-2
                  rounded-[var(--radius-md)]
                  bg-[var(--green)]
                  px-5
                  font-semibold
                  text-[var(--navy)]
                  shadow-[0_6px_20px_rgba(65,181,140,0.14)]
                  transition-all
                  duration-200

                  hover:border-[var(--green-400)]
                  hover:bg-[var(--green-400)]
                "
              >
                <User className="h-5 w-5" strokeWidth={1.9} />

                <span>{user.fullName ?? 'پروفایل'}</span>

                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    menuOpen && 'rotate-180',
                  )}
                  strokeWidth={1.8}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    role="menu"
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.98,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="
                      absolute
                      left-0
                      mt-2
                      w-60
                      overflow-hidden
                      rounded-[var(--radius-md)]
                      border
                      border-[var(--line)]
                      bg-white
                      py-2
                      text-[var(--ink)]
                      shadow-[var(--shadow-lg)]
                    "
                  >
                    <MenuLink href="/account/profile" icon={<User className="h-[18px] w-[18px]" />}>
                      پروفایل کاربر
                    </MenuLink>

                    <MenuLink
                      href="/account/listings"
                      icon={<FileText className="h-[18px] w-[18px]" />}
                    >
                      آگهی‌های من
                    </MenuLink>

                    <MenuLink
                      href="/account/favorites"
                      icon={<Heart className="h-[18px] w-[18px]" />}
                    >
                      علاقه‌مندی‌ها
                    </MenuLink>

                    {isStaff(user.role) && (
                      <>
                        <div className="mx-3 my-1 border-t border-[var(--line-soft)]" />

                        <MenuLink
                          href="/admin"
                          icon={<LayoutDashboard className="h-[18px] w-[18px]" />}
                        >
                          پنل مدیریت
                        </MenuLink>
                      </>
                    )}

                    <div className="mx-3 my-1 border-t border-[var(--line-soft)]" />

                    <button
                      type="button"
                      onClick={logout}
                      className="
                        flex w-full
                        items-center
                        gap-3
                        px-4
                        py-3
                        text-[15px]
                        text-[var(--danger)]
                        transition-colors

                        hover:bg-[var(--danger-soft)]
                      "
                    >
                      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
                      خروج از حساب
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Login desktop */
            <Link
              href="/auth"
              className="
                hidden h-12
                items-center
                gap-2
                rounded-[var(--radius-md)]
                border
                border-[var(--green-300)]
                bg-[var(--green)]
                px-6
                font-semibold
                text-[var(--navy)]
                shadow-[0_6px_20px_rgba(65,181,140,0.14)]
                transition-all
                duration-200

                hover:border-[var(--green-400)]
                hover:bg-[var(--green-400)]

                lg:flex
              "
            >
              <User className="h-5 w-5" strokeWidth={1.9} />
ثبت نام و ثبت آگهی
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={mobileOpen}
            className="
              flex h-11 w-11
              items-center
              justify-center
              rounded-[var(--radius-sm)]
              text-white
              transition-colors

              hover:bg-white/10

              lg:hidden
            "
          >
            {mobileOpen ? (
              <X className="h-6 w-6" strokeWidth={1.8} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.nav
            aria-label="ناوبری موبایل"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="
              overflow-hidden
              border-t
              border-white/10
              bg-[var(--navy-alt)]
              lg:hidden
            "
          >
            <div className="container flex flex-col py-3">
              {NAV.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      `
                        relative
                        flex min-h-[52px]
                        items-center
                        border-b
                        border-white/[0.06]
                        px-1
                        text-[15px]
                        transition-colors
                      `,
                      active
                        ? `
                          font-semibold
                          text-[var(--green-300)]
                        `
                        : `
                          text-white/85
                          hover:text-white
                        `,
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="
                          ml-2
                          h-5
                          w-[3px]
                          rounded-full
                          bg-[var(--green)]
                        "
                      />
                    )}

                    {item.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <MobileMenuLink
                    href="/account/profile"
                    icon={<User className="h-[18px] w-[18px]" />}
                  >
                    پروفایل کاربر
                  </MobileMenuLink>

                  <MobileMenuLink
                    href="/account/listings"
                    icon={<FileText className="h-[18px] w-[18px]" />}
                  >
                    آگهی‌های من
                  </MobileMenuLink>

                  {isStaff(user.role) && (
                    <MobileMenuLink
                      href="/admin"
                      icon={<LayoutDashboard className="h-[18px] w-[18px]" />}
                    >
                      پنل مدیریت
                    </MobileMenuLink>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="
                      mt-2
                      flex min-h-[50px]
                      items-center
                      gap-2
                      rounded-[var(--radius-sm)]
                      px-3
                      text-start
                      text-[var(--danger-soft)]
                      transition-colors

                      hover:bg-white/[0.06]
                    "
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    خروج از حساب
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="
                    mt-4
                    flex h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-[var(--radius-md)]
                    bg-[var(--green)]
                    font-semibold
                    text-[var(--navy)]
                    transition-colors
                    hover:bg-[var(--green-400)]
                  "
                >
                  <User className="h-5 w-5" />
                  ثبت نام و ثبت آگهی
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="
        group
        flex items-center
        gap-3
        px-4
        py-3
        text-[15px]
        text-[var(--text-body)]
        transition-colors

        hover:bg-[var(--green-soft)]
        hover:text-[var(--navy)]
      "
    >
      <span
        className="
          text-[var(--text-muted)]
          transition-colors
          group-hover:text-[var(--green-700)]
        "
      >
        {icon}
      </span>

      {children}
    </Link>
  );
}

function MobileMenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        flex min-h-[50px]
        items-center
        gap-3
        border-b
        border-white/[0.05]
        px-1
        text-[15px]
        text-white/85
        transition-colors

        hover:text-white
      "
    >
      <span className="text-[var(--green-300)]">{icon}</span>

      {children}
    </Link>
  );
}
