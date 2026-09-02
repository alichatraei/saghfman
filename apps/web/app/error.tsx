'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-brand">صفحه بارگذاری نشد</h1>
      <p className="max-w-md text-muted">
        ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-brand px-6 py-3 font-medium text-white hover:bg-brand-alt"
      >
        تلاش دوباره
      </button>
    </div>
  );
}
