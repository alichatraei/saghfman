import { ShieldCheck, Search, MessagesSquare } from 'lucide-react';

const REASONS = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'آگهی‌های واقعی و بررسی‌شده',
    body: 'هر آگهی پیش از انتشار توسط کارشناسان ما بررسی و تأیید می‌شود.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'جستجوی سریع و دقیق',
    body: 'با فیلترهای پیشرفته، سریع‌تر به ملک دلخواهتان می‌رسید.',
  },
  {
    icon: <MessagesSquare className="h-6 w-6" />,
    title: 'ارتباط آسان با کارشناسان شرکت',
    body: 'برای بازدید و مشاوره کافی است با شماره شرکت تماس بگیرید.',
  },
];

export function WhyUs() {
  return (
    <section
      className="rounded-lg border border-brand bg-[var(--background-soft)] p-6 lg:p-7"
      aria-labelledby="why-us-heading"
    >
      <h2 id="why-us-heading" className="gold-underline text-xl font-bold text-brand">
        چرا سقف من؟
      </h2>
      <ul className="mt-6 space-y-6">
        {REASONS.map((reason) => (
          <li key={reason.title} className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-brand text-brand shadow-card">
              {reason.icon}
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-brand">{reason.title}</h3>
              <p className="text-sm leading-7 text-muted">{reason.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
