import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <p className="num text-6xl font-bold text-gold">۴۰۴</p>
      <h1 className="text-2xl font-bold text-brand">این صفحه پیدا نشد</h1>
      <p className="max-w-md text-muted">
        ممکن است آگهی حذف یا منقضی شده باشد. از فهرست آگهی‌ها ملک مورد نظرتان را پیدا کنید.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/properties"
          className="rounded bg-brand px-6 py-3 font-medium text-white hover:bg-brand-alt"
        >
          مشاهده آگهی‌ها
        </Link>
        <Link
          href="/"
          className="rounded border border-line bg-white px-6 py-3 font-medium text-brand hover:border-gold"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
