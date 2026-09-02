import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ContentProtection } from '@/components/layout/content-protection';
import { AnnouncementBanner } from '@/components/home/announcement-banner';
import { apiFetch } from '@/lib/api';
import type { BannerDto } from '@saghf/types';

async function getBanners(): Promise<BannerDto[]> {
  try {
    return await apiFetch<BannerDto[]>('/banners?position=home-top', { revalidate: 60 });
  } catch {
    return [];
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const banners = await getBanners();

  return (
    <div className="flex min-h-screen flex-col">
      <ContentProtection />
      <AnnouncementBanner banners={banners} />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}