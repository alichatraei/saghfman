import { Skeleton } from '@/components/ui/states';

export default function PropertyLoading() {
  return (
    <div className="container py-6 lg:py-9">
      <Skeleton className="mb-5 h-5 w-72" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
