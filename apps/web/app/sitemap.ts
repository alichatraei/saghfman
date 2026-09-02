import type { MetadataRoute } from 'next';
import { apiFetch, SITE_URL } from '@/lib/api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/properties?transaction=sale`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/properties?transaction=rent`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/submit-property`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  try {
    const rows = await apiFetch<{ slug: string; updatedAt: string }[]>('/properties/sitemap', {
      revalidate: 3600,
    });
    return [
      ...staticRoutes,
      ...rows.map((row) => ({
        url: `${SITE_URL}/properties/${row.slug}`,
        lastModified: new Date(row.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
