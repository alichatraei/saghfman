'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from './auth-store';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  const refresh = useAuthStore((state) => state.refresh);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Silently renew the short-lived access token on load and every 12 minutes.
    if (accessToken) void refresh();
    const timer = setInterval(() => void refresh(), 12 * 60 * 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
