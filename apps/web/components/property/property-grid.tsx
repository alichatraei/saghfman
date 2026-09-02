import type { PropertyCardDto } from '@saghf/types';
import { PropertyCard } from './property-card';
import { EmptyState, PropertyCardSkeleton } from '@/components/ui/states';
import { SearchX } from 'lucide-react';

export function PropertyGrid({
  properties,
  loading,
  skeletonCount = 6,
  columns = 3,
}: {
  properties: PropertyCardDto[];
  loading?: boolean;
  skeletonCount?: number;
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : columns === 2
        ? 'grid gap-5 sm:grid-cols-2'
        : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3';

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-7 w-7 text-[var(--green-600)]" strokeWidth={1.8} />}
        title="آگهی‌ای با این مشخصات پیدا نشد"
        description="فیلترها را ساده‌تر کنید یا محله دیگری را امتحان کنید. می‌توانید ملک خودتان را هم همین‌جا ثبت کنید."
        actionLabel="ثبت آگهی ملک"
        actionHref="/submit-property"
      />
    );
  }

  return (
    <div className={gridClass}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
