'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Skeleton } from '@/components/ui/states';

/** Client-side guard for account pages (the API enforces this server-side too). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().accessToken) {
          router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [token, pathname, router]);

  if (!user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
