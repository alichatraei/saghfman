import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubmitWizard } from '@/components/submit/submit-wizard';

export const metadata: Metadata = {
  title: 'ثبت آگهی ملک',
  description: 'ملک خود را در سه گام ساده ثبت کنید؛ پس از بررسی کارشناسان، آگهی شما منتشر می‌شود.',
  alternates: { canonical: '/submit-property' },
};

export default function SubmitPropertyPage() {
  return (
    <div className="container py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="gold-underline text-2xl font-bold text-brand">ثبت آگهی ملک</h1>
        <p className="mt-4 text-[15px] text-muted">
          اطلاعات ملک را کامل وارد کنید. شماره موبایل شما روی آگهی نمایش داده نمی‌شود و تماس
          متقاضیان از طریق شماره شرکت انجام می‌شود.
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <SubmitWizard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
