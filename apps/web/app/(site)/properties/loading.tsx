import { PropertyCardSkeleton, Skeleton } from '@/components/ui/states';

export default function PropertiesLoading() {
  return (
    <div className="container py-8 lg:py-10">
      <Skeleton className="mb-6 h-9 w-48" />
      <Skeleton className="mb-6 h-20 w-full" />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Skeleton className="hidden h-[520px] w-full lg:block" />
        <div>
          <Skeleton className="mb-5 h-16 w-full" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
