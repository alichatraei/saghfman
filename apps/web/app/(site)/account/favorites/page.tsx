'use client';

import { Heart } from 'lucide-react';
import { PropertyGrid } from '@/components/property/property-grid';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { useFavorites } from '@/lib/hooks';

export default function FavoritesPage() {
  const { data, isLoading, isError, error, refetch } = useFavorites();

  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!isLoading && (data?.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-7 w-7" />}
        title="هنوز ملکی ذخیره نکرده‌اید"
        description="با زدن آیکون قلب روی هر آگهی، آن را اینجا ذخیره کنید تا بعداً راحت پیدایش کنید."
        actionLabel="مشاهده آگهی‌ها"
        actionHref="/properties"
      />
    );
  }

  return <PropertyGrid properties={data ?? []} loading={isLoading} skeletonCount={3} columns={2} />;
}
