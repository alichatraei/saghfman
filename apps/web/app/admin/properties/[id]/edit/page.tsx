import { EditPropertyForm } from '@/components/account/edit-property-form';

export const metadata = { title: 'ویرایش آگهی — پنل مدیریت', robots: { index: false, follow: false } };

export default function AdminEditPropertyPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-5 text-xl font-bold text-[var(--navy)] sm:text-2xl">ویرایش آگهی</h1>
      <EditPropertyForm propertyId={params.id} mode="admin" />
    </div>
  );
}
