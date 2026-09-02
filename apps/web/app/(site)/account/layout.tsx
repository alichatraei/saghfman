import { AccountNav } from '@/components/account/account-nav';
import { RequireAuth } from '@/components/account/require-auth';

export const metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8 lg:py-10">
      <h1 className="gold-underline mb-6 text-2xl font-bold text-brand">حساب کاربری</h1>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AccountNav />
        <div>
          <RequireAuth>{children}</RequireAuth>
        </div>
      </div>
    </div>
  );
}
