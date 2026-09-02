import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Paginated, PropertyCardDto } from '@saghf/types';
import { apiFetch, buildQuery } from '@/lib/api';
import { FiltersSidebar } from '@/components/property/filters-sidebar';
import { MobileFilters } from '@/components/property/mobile-filters';
import { SortToolbar } from '@/components/property/sort-toolbar';
import { Pagination } from '@/components/property/pagination';
import { PropertyGrid } from '@/components/property/property-grid';
import { SearchBar } from '@/components/property/search-bar';
import { ErrorState } from '@/components/ui/states';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'آگهی‌های ملک',
  description:
    'جستجو در میان آگهی‌های خرید، فروش و اجاره ملک با فیلترهای دقیق قیمت، متراژ، اتاق و امکانات.',
  alternates: { canonical: '/properties' },
};

type SearchParams = Record<string, string | string[] | undefined>;

const EMPTY: Paginated<PropertyCardDto> = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
};

async function getProperties(
  searchParams: SearchParams,
): Promise<{ data: Paginated<PropertyCardDto>; error?: string }> {
  const params: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    params[key] = Array.isArray(value) ? value[0] : value;
  }
  try {
    const data = await apiFetch<Paginated<PropertyCardDto>>(`/properties${buildQuery(params)}`);
    return { data };
  } catch (error) {
    return { data: EMPTY, error: (error as Error).message };
  }
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const { data, error } = await getProperties(searchParams);

  return (
    <div className="container py-8 lg:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 text-sm text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/" className="hover:text-brand">
              خانه
            </a>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-brand">آگهی‌ها</li>
        </ol>
      </nav>

      <h1 className="gold-underline mb-6 text-2xl font-bold text-brand">آگهی‌های ملک</h1>

      <div className="mb-6">
        <Suspense fallback={null}>
          <SearchBar compact />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="lg:hidden">
          <Suspense fallback={null}>
            <MobileFilters />
          </Suspense>
        </div>

        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <FiltersSidebar />
          </Suspense>
        </div>

        <div>
          {error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <Suspense fallback={null}>
                <SortToolbar total={data.total} />
              </Suspense>
              <PropertyGrid properties={data.items} />
              <Suspense fallback={null}>
                <Pagination page={data.page} totalPages={data.totalPages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
