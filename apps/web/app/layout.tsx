import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { SITE_URL } from '@/lib/api';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'سقف من';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — خرید، فروش و اجاره ملک`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'سقف من، سامانه تخصصی املاک برای خرید، فروش و اجاره ملک. آگهی‌های بررسی‌شده، جستجوی دقیق و ارتباط آسان با کارشناسان شرکت.',
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  keywords: ['خرید ملک', 'فروش ملک', 'اجاره آپارتمان', 'رهن و اجاره', 'ویلا', 'املاک تهران'],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — خرید، فروش و اجاره ملک`,
    description: 'ساده‌ترین راه برای خرید، فروش و اجاره ملک.',
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'علی چترایی' }],
  creator: 'علی چترایی',
  publisher: SITE_NAME,
  other: {
    'copyright': `© ${new Date().getFullYear()} ${SITE_NAME} — تمامی حقوق محفوظ است.`,
    'designer': 'علی چترایی',
  },
};

export const viewport: Viewport = {
  themeColor: '#08263A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-brand"
        >
          رفتن به محتوای اصلی
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
