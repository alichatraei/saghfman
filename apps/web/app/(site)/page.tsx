import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type {PropertyCardDto } from '@saghf/types';
import { apiFetch } from '@/lib/api';
import { SearchBar } from '@/components/property/search-bar';
import { IntentCards } from '@/components/home/intent-cards';
import { WhyUs } from '@/components/home/why-us';
import { PropertyGrid } from '@/components/property/property-grid';
import { toPersianDigits } from '@/lib/format';
import Image from 'next/image';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'خرید، فروش و اجاره ملک',
  description:
    'در سقف من ملک مورد نظرتان را پیدا کنید یا آگهی ملک خود را ثبت کنید. آگهی‌های بررسی‌شده در اصفهان.',
  alternates: { canonical: '/' },
};

async function getFeatured(): Promise<PropertyCardDto[]> {
  try {
    return await apiFetch<PropertyCardDto[]>('/properties/featured?limit=6', { revalidate: 300 });
  } catch {
    return [];
  }
}

export default async function HomePage() {

  const featured = await getFeatured();

  return (
    <>
      {/* ---------------------------- Hero ---------------------------- */}
      <section
        className="relative isolate min-h-[500px] overflow-hidden bg-brand lg:min-h-[560px]"
        aria-labelledby="hero-heading"
      >
        {/* Background image */}
        <Image
          src="/images/hero_bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-30 object-cover object-center"
        />

        {/* Main navy overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{
            background:
              'linear-gradient(90deg, rgba(8,38,58,0.94) 0%, rgba(8,38,58,0.76) 50%, rgba(8,38,58,0.94) 100%)',
          }}
        />

        {/* Subtle premium glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 75% 20%, rgba(214,175,112,0.16) 0%, transparent 34%), radial-gradient(circle at 20% 80%, rgba(18,77,112,0.24) 0%, transparent 38%)',
          }}
        />

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy/80 to-transparent"
        />

        <div className="container relative flex min-h-[500px] flex-col items-center justify-center py-14 text-center lg:min-h-[560px] lg:py-20">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-gold backdrop-blur-md">
            پلتفرم تخصصی خرید، فروش و اجاره ملک
          </div>

          <h1
            id="hero-heading"
            className="max-w-4xl text-3xl font-bold leading-[1.6] text-white md:text-4xl lg:text-5xl"
          >
            سقفی که دنبالش بودید،
            <span className="text-green-600"> همین‌جاست</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-white/75 md:text-base lg:text-lg">
            خرید، فروش و اجاره ملک، ساده و مطمئن. کارشناسان ما هر آگهی را پیش از انتشار بررسی
            می‌کنند.
          </p>

          {/* Search */}
          <div className="mx-auto mt-9 w-full max-w-5xl text-start">
            <div className="rounded-[20px] border border-white/15 bg-white/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- Intent cards ------------------------ */}
      <section className="container -mt-8 lg:-mt-10" aria-labelledby="intent-heading">
        <h2 id="intent-heading" className="sr-only">
          چه کاری می‌خواهید انجام دهید؟
        </h2>
        <IntentCards />
      </section>

      {/* --------------------------- Featured -------------------------- */}
      <section className="container mt-16" aria-labelledby="featured-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              id="featured-heading"
              className="gold-underline text-xl font-bold text-brand lg:text-2xl"
            >
              آگهی‌های ویژه
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              منتخب کارشناسان ما از میان آگهی‌های تأییدشده
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden shrink-0 items-center gap-1.5 text-[15px] font-medium text-brand hover:text-gold sm:flex"
          >
            مشاهده همه آگهی‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <PropertyGrid properties={featured} />

        <div className="mt-6 sm:hidden">
          <Link
            href="/properties"
            className="flex h-12 items-center justify-center gap-2 rounded border border-line bg-white font-medium text-brand"
          >
            مشاهده همه آگهی‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ------------------------- Why + stats ------------------------- */}
      <section className="container mt-16 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="surface p-6 lg:p-8">
          <h2 className="gold-underline text-xl font-bold text-brand">
            ملک خود را رایگان ثبت کنید
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-muted">
            در سه گام ساده مشخصات ملک، قیمت و تصاویر را وارد کنید. پس از بررسی کارشناسان، آگهی شما
            منتشر می‌شود و متقاضیان از طریق شماره تماس شرکت پیگیری می‌کنند — شماره شخصی شما هرگز روی
            سایت نمایش داده نمی‌شود.
          </p>
          <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-6 text-center">
            <div>
              <dt className="text-sm text-muted">آگهی فعال</dt>
              <dd className="num mt-1 text-xl font-bold text-brand">+{toPersianDigits(1200)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">محله تحت پوشش</dt>
              <dd className="num mt-1 text-xl font-bold text-brand">+{toPersianDigits(80)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">بررسی آگهی</dt>
              <dd className="num mt-1 text-xl font-bold text-brand">{toPersianDigits(24)} ساعته</dd>
            </div>
          </dl>
          <Link
            href="/submit-property"
            className="mt-7 inline-flex h-12 items-center rounded bg-gold px-7 font-medium text-brand transition-colors hover:bg-gold-dark"
          >
            شروع ثبت آگهی
          </Link>
        </div>

        <WhyUs />
      </section>
    </>
  );
}
