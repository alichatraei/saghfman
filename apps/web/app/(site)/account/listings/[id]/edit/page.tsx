import { EditPropertyForm } from '@/components/account/edit-property-form';

export const metadata = { title: 'ویرایش آگهی', robots: { index: false, follow: false } };

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <EditPropertyForm propertyId={params.id} />;
}
