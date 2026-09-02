import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPanel } from '@/components/auth/auth-panel';
import { ShieldCheck, Clock, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ورود و ثبت‌نام',
  description: 'برای ثبت آگهی و ذخیره ملک‌های مورد علاقه وارد حساب کاربری خود شوید.',
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <div className="container py-10 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg shadow-panel lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-brand p-10 text-white lg:flex">
          <div>
            <h2 className="text-2xl font-bold">به سقف من خوش آمدید</h2>
            <p className="mt-4 leading-8 text-white/85">
              با یک شماره موبایل وارد شوید؛ نیازی به رمز عبور نیست. کد ورود از طریق پیامک برای شما
              ارسال می‌شود.
            </p>
          </div>

          <ul className="mt-10 space-y-5">
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="حریم خصوصی شما محفوظ است">
              شماره موبایل شما هرگز روی آگهی‌ها نمایش داده نمی‌شود.
            </Feature>
            <Feature icon={<Building2 className="h-5 w-5" />} title="ثبت رایگان آگهی">
              ملک خود را در سه گام ساده ثبت کنید.
            </Feature>
            <Feature icon={<Clock className="h-5 w-5" />} title="بررسی سریع">
              کارشناسان ما آگهی‌ها را در کوتاه‌ترین زمان بررسی می‌کنند.
            </Feature>
          </ul>
        </section>

        <section className="bg-white p-8 lg:p-10">
          <Suspense fallback={null}>
            <AuthPanel />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
        {icon}
      </span>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-white/75">{children}</p>
      </div>
    </li>
  );
}
