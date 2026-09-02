'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Save } from 'lucide-react';
import type { MyPropertyDetailDto } from '@saghf/types';
import { Button } from '@/components/ui/button';
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
  Toggle,
} from '@/components/ui/field';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { ImageUploader, type UploadedImage } from '@/components/submit/image-uploader';
import {
  CABINET_OPTIONS,
  CharacterCounter,
  ChoiceField,
  COOLING_OPTIONS,
  DEED_TYPES,
  DESCRIPTION_MAX,
  ExtraAmenities,
  FLOOR_OPTIONS,
  HEATING_OPTIONS,
  LAND_AREA_TYPES,
  NumberField,
  RENTAL_TRANSACTIONS,
  RoomsField,
  syncAmenities,
  TITLE_MAX,
  WALL_OPTIONS,
  YesNoField,
} from '@/components/submit/property-fields';
import { apiFetch, ApiError } from '@/lib/api';
import {
  useAmenities,
  useCities,
  useNeighborhoods,
  usePropertyTypes,
  useToken,
  useTransactionTypes,
} from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { digitsOnly, formatTomanShort, toPersianDigits } from '@/lib/format';

interface FormState {
  title: string;
  description: string;
  propertyType: string;
  transaction: string;
  city: string;
  neighborhood: string;
  address: string;
  displayAddress: string;
  showExactLocation: boolean;
  area: string;
  hallArea: string;
  landArea: string;
  rooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  constructionYear: string;
  heating: string;
  cooling: string;
  cabinet: string;
  floorMaterial: string;
  wallMaterial: string;
  hasElevator: boolean;
  hasParking: boolean;
  hasStorage: boolean;
  hasTerrace: boolean;
  price: string;
  deposit: string;
  monthlyRent: string;
  isNegotiable: boolean;
  exchangeable: boolean;
  deedType: string;
  amenities: string[];
  images: UploadedImage[];
}

/**
 * Shared edit form. Owners reach it from «آگهی‌های من» and staff from the
 * admin panel; the only differences are the endpoint used to prefill the form,
 * where «بازگشت» leads, and the moderation notice.
 */
export function EditPropertyForm({
  propertyId,
  mode = 'owner',
}: {
  propertyId: string;
  mode?: 'owner' | 'admin';
}) {
  const isAdmin = mode === 'admin';
  const backHref = isAdmin ? '/admin/properties' : '/account/listings';
  const backLabel = isAdmin ? 'بازگشت به مدیریت آگهی‌ها' : 'بازگشت به آگهی‌های من';
  const router = useRouter();
  const token = useToken();
  const queryClient = useQueryClient();

  const { data: propertyTypes } = usePropertyTypes();
  const { data: transactionTypes } = useTransactionTypes();
  const { data: cities } = useCities();
  const [selectedCity, setSelectedCity] = useState('');
  const { data: neighborhoods } = useNeighborhoods(undefined, selectedCity || undefined);
  const { data: amenities } = useAmenities();

  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const property = await apiFetch<MyPropertyDetailDto>(
          isAdmin ? `/admin/properties/${propertyId}` : `/me/properties/${propertyId}`,
          { token },
        );
        if (cancelled) return;
        setSelectedCity(property.city);
        setForm({
          title: property.title,
          description: property.description,
          propertyType: property.propertyTypeSlug,
          transaction: property.transactionSlug,
          city: property.city,
          neighborhood: property.neighborhoodSlug,
          address: property.address,
          displayAddress: property.displayAddress,
          showExactLocation: property.showExactLocation,
          area: String(property.area),
          hallArea: property.hallArea ? String(property.hallArea) : '',
          landArea: property.landArea ? String(property.landArea) : '',
          rooms: String(property.rooms),
          bathrooms: property.bathrooms ? String(property.bathrooms) : '',
          floor: property.floor !== null ? String(property.floor) : '',
          totalFloors: property.totalFloors ? String(property.totalFloors) : '',
          constructionYear: property.constructionYear ? String(property.constructionYear) : '',
          heating: property.heating ?? '',
          cooling: property.cooling ?? '',
          cabinet: property.cabinet ?? '',
          floorMaterial: property.floorMaterial ?? '',
          wallMaterial: property.wallMaterial ?? '',
          hasElevator: property.amenitySlugs.includes('elevator'),
          hasParking: property.parkingCount > 0,
          hasStorage: property.amenitySlugs.includes('storage'),
          hasTerrace: property.amenitySlugs.includes('balcony'),
          price: property.price ?? '',
          deposit: property.deposit ?? '',
          monthlyRent: property.monthlyRent ?? '',
          isNegotiable: property.isNegotiable,
          exchangeable: property.exchangeable,
          deedType: property.deedType ?? '',
          amenities: property.amenitySlugs,
          images: property.images.map((image) => ({
            url: image.url,
            width: image.width ?? undefined,
            height: image.height ?? undefined,
            isCover: image.isCover,
          })),
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof ApiError ? error.message : 'آگهی بارگذاری نشد.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId, token, isAdmin]);

  if (loadError) return <ErrorState message={loadError} />;

  if (!form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isRental = RENTAL_TRANSACTIONS.includes(form.transaction);
  const showsLandArea = LAND_AREA_TYPES.includes(form.propertyType);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((state) => (state ? { ...state, [key]: value } : state));
    setErrors((state) => ({ ...state, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.title.trim().length < 10) next.title = 'عنوان باید حداقل ۱۰ کاراکتر باشد.';
    if (form.title.trim().length > TITLE_MAX)
      next.title = `عنوان نباید بیشتر از ${TITLE_MAX} کاراکتر باشد.`;
    if (form.description.trim().length > DESCRIPTION_MAX)
      next.description = `توضیحات نباید بیشتر از ${DESCRIPTION_MAX} کاراکتر باشد.`;
    if (isRental && form.floor === '') next.floor = 'برای آگهی اجاره، طبقه ملک را وارد کنید.';
    if (form.address.trim().length < 5) next.address = 'آدرس ملک را وارد کنید.';
    if (!form.area || Number(form.area) < 10) next.area = 'متراژ را وارد کنید (حداقل ۱۰ متر).';
    if (isRental && !form.deposit && !form.monthlyRent) {
      next.deposit = 'مبلغ ودیعه یا اجاره ماهانه را وارد کنید.';
    }
    if (!isRental && !form.price) next.price = 'قیمت کل را وارد کنید.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setServerError(undefined);
    try {
      await apiFetch<MyPropertyDetailDto>(`/properties/${propertyId}`, {
        method: 'PATCH',
        token,
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          propertyType: form.propertyType,
          transaction: form.transaction,
          neighborhood: form.neighborhood,
          address: form.address.trim(),
          displayAddress: form.displayAddress.trim() || undefined,
          showExactLocation: isRental ? false : form.showExactLocation,
          area: Number(form.area),
          hallArea: form.hallArea ? Number(form.hallArea) : undefined,
          landArea: showsLandArea && form.landArea ? Number(form.landArea) : undefined,
          rooms: Number(form.rooms || 0),
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
          constructionYear: form.constructionYear ? Number(form.constructionYear) : undefined,
          floor: form.floor !== '' ? Number(form.floor) : undefined,
          parkingCount: form.hasParking ? 1 : 0,
          hasElevator: form.hasElevator,
          hasStorage: form.hasStorage,
          hasBalcony: form.hasTerrace,
          heating: form.heating || undefined,
          cooling: form.cooling || undefined,
          cabinet: form.cabinet || undefined,
          floorMaterial: form.floorMaterial || undefined,
          wallMaterial: form.wallMaterial || undefined,
          deedType: isRental ? undefined : form.deedType || undefined,
          price: !isRental && form.price ? form.price : undefined,
          deposit: isRental && form.deposit ? form.deposit : undefined,
          monthlyRent: isRental && form.monthlyRent ? form.monthlyRent : undefined,
          isNegotiable: isRental ? false : form.isNegotiable,
          exchangeable: isRental ? false : form.exchangeable,
          amenities: syncAmenities(form.amenities, {
            elevator: form.hasElevator,
            parking: form.hasParking,
            storage: form.hasStorage,
            terrace: form.hasTerrace,
          }),
          images: form.images.map((image, index) => ({
            url: image.url,
            width: image.width,
            height: image.height,
            isCover: index === 0,
            order: index,
          })),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: [isAdmin ? 'admin-properties' : 'my-properties'],
      });
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'ذخیره تغییرات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="surface flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="text-xl font-bold text-brand">تغییرات ذخیره شد</h2>
        <p className="max-w-lg text-[15px] leading-8 text-muted">
          {isAdmin
            ? 'ویرایش شما ثبت شد. وضعیت انتشار آگهی تغییری نکرده است.'
            : 'آگهی ویرایش‌شده دوباره در صف بررسی کارشناسان قرار گرفت و پس از تأیید منتشر می‌شود.'}
        </p>
        <Button onClick={() => router.push(backHref)} className="mt-2">
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="space-y-6"
      noValidate
    >
      <Link href={backHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowRight className="h-4 w-4" />
        {backLabel}
      </Link>

      <p className="rounded border border-gold/40 bg-gold-soft/60 p-4 text-sm leading-7 text-brand">
        {isAdmin
          ? 'ویرایش از پنل مدیریت، وضعیت انتشار آگهی را تغییر نمی‌دهد؛ برای انتشار یا رد، از دکمه‌های صفحه مدیریت آگهی‌ها استفاده کنید.'
          : 'پس از ذخیره، آگهی دوباره به وضعیت «در انتظار بررسی» می‌رود تا کارشناسان تغییرات را تأیید کنند.'}
      </p>

      <section className="surface p-4 sm:p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">مشخصات ملک</h2>
        <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title" required hint={`حداکثر ${toPersianDigits(TITLE_MAX)} کاراکتر`}>
              عنوان آگهی
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => set('title', event.target.value.slice(0, TITLE_MAX))}
              maxLength={TITLE_MAX}
              invalid={Boolean(errors.title)}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <Label htmlFor="propertyType" required>
              نوع ملک
            </Label>
            <Select
              id="propertyType"
              value={form.propertyType}
              onChange={(event) => set('propertyType', event.target.value)}
            >
              {propertyTypes?.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.title}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="transaction" required>
              نوع آگهی
            </Label>
            <Select
              id="transaction"
              value={form.transaction}
              onChange={(event) => set('transaction', event.target.value)}
            >
              {transactionTypes?.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.title}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="city" required>
              شهر
            </Label>
            <Select
              id="city"
              value={form.city}
              onChange={(event) => {
                // با تغییر شهر، محله باید دوباره انتخاب شود.
                setSelectedCity(event.target.value);
                setForm((state) =>
                  state ? { ...state, city: event.target.value, neighborhood: '' } : state,
                );
              }}
            >
              <option value="">انتخاب کنید</option>
              {cities?.map((item) => (
                <option key={item.city} value={item.city}>
                  {item.city}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="neighborhood" required>
              محله
            </Label>
            <Select
              id="neighborhood"
              value={form.neighborhood}
              onChange={(event) => set('neighborhood', event.target.value)}
              disabled={!form.city}
            >
              <option value="">{form.city ? 'انتخاب کنید' : 'ابتدا شهر را انتخاب کنید'}</option>
              {neighborhoods?.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </Select>
          </div>

          <NumberField
            id="area"
            label="متراژ بنا"
            hint="متر مربع"
            required
            value={form.area}
            onChange={(value) => set('area', value)}
            error={errors.area}
          />

          <NumberField
            id="hallArea"
            label="مساحت سالن"
            hint="متر مربع"
            value={form.hallArea}
            onChange={(value) => set('hallArea', value)}
          />

          <RoomsField id="rooms" value={form.rooms} onChange={(value) => set('rooms', value)} />

          {showsLandArea && (
            <NumberField
              id="landArea"
              label="متراژ زمین"
              hint="فقط برای ویلا، خانه، زمین و باغ"
              value={form.landArea}
              onChange={(value) => set('landArea', value)}
            />
          )}

          <NumberField
            id="bathrooms"
            label="سرویس بهداشتی"
            value={form.bathrooms}
            onChange={(value) => set('bathrooms', value)}
          />

          <NumberField
            id="floor"
            label="طبقه"
            required={isRental}
            hint={isRental ? 'برای آگهی اجاره الزامی است' : undefined}
            value={form.floor}
            onChange={(value) => set('floor', value)}
            error={errors.floor}
          />

          <NumberField
            id="totalFloors"
            label="کل طبقات"
            value={form.totalFloors}
            onChange={(value) => set('totalFloors', value)}
          />

          <NumberField
            id="constructionYear"
            label="سال ساخت"
            hint="شمسی"
            maxLength={4}
            value={form.constructionYear}
            onChange={(value) => set('constructionYear', value)}
          />

          <ChoiceField
            id="edit-heating"
            label="گرمایش"
            value={form.heating}
            onChange={(value) => set('heating', value)}
            options={HEATING_OPTIONS}
          />

          <ChoiceField
            id="edit-cooling"
            label="سرمایش"
            value={form.cooling}
            onChange={(value) => set('cooling', value)}
            options={COOLING_OPTIONS}
          />

          <ChoiceField
            id="edit-cabinet"
            label="جنس کابینت"
            value={form.cabinet}
            onChange={(value) => set('cabinet', value)}
            options={CABINET_OPTIONS}
          />

          <ChoiceField
            id="edit-floorMaterial"
            label="کف‌پوش"
            value={form.floorMaterial}
            onChange={(value) => set('floorMaterial', value)}
            options={FLOOR_OPTIONS}
          />

          <ChoiceField
            id="edit-wallMaterial"
            label="پوشش دیوار"
            value={form.wallMaterial}
            onChange={(value) => set('wallMaterial', value)}
            options={WALL_OPTIONS}
          />

          <YesNoField
            id="edit-hasElevator"
            label="آسانسور"
            checked={form.hasElevator}
            onChange={(value) => set('hasElevator', value)}
          />

          <YesNoField
            id="edit-hasParking"
            label="پارکینگ"
            checked={form.hasParking}
            onChange={(value) => set('hasParking', value)}
          />

          <YesNoField
            id="edit-hasStorage"
            label="انباری"
            checked={form.hasStorage}
            onChange={(value) => set('hasStorage', value)}
          />

          <YesNoField
            id="edit-hasTerrace"
            label="تراس"
            checked={form.hasTerrace}
            onChange={(value) => set('hasTerrace', value)}
          />

          <div className="md:col-span-2">
            <Label
              htmlFor="address"
              required
              hint={isRental ? 'نام منطقه و خیابان' : 'فقط برای کارشناسان ما قابل مشاهده است'}
            >
              {isRental ? 'منطقه و خیابان ملک' : 'آدرس دقیق ملک'}
            </Label>
            <Input
              id="address"
              value={form.address}
              onChange={(event) => set('address', event.target.value)}
              invalid={Boolean(errors.address)}
            />
            <FieldError message={errors.address} />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="displayAddress" hint="متنی که روی آگهی دیده می‌شود">
              آدرس نمایشی
            </Label>
            <Input
              id="displayAddress"
              value={form.displayAddress}
              onChange={(event) => set('displayAddress', event.target.value)}
            />
          </div>

          {/* آگهی اجاره روی نقشه پین نمی‌شود. */}
          {!isRental && (
            <div className="md:col-span-2">
              <YesNoField
                id="edit-showExactLocation"
                label="نمایش موقعیت دقیق روی نقشه"
                description="اگر غیرفعال باشد فقط محله ملک روی نقشه نشان داده می‌شود."
                checked={form.showExactLocation}
                onChange={(value) => set('showExactLocation', value)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="surface p-4 sm:p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">قیمت و شرایط</h2>
        <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2">
          {isRental ? (
            <>
              <div>
                <Label htmlFor="deposit" required hint="تومان">
                  مبلغ ودیعه
                </Label>
                <Input
                  id="deposit"
                  value={form.deposit}
                  onChange={(event) => set('deposit', digitsOnly(event.target.value))}
                  inputMode="numeric"
                  className="num"
                  invalid={Boolean(errors.deposit)}
                />
                <p className="num mt-1.5 text-sm text-muted">{formatTomanShort(form.deposit)}</p>
                <FieldError message={errors.deposit} />
              </div>
              <div>
                <Label htmlFor="monthlyRent" hint="تومان">
                  اجاره ماهانه
                </Label>
                <Input
                  id="monthlyRent"
                  value={form.monthlyRent}
                  onChange={(event) => set('monthlyRent', digitsOnly(event.target.value))}
                  inputMode="numeric"
                  className="num"
                />
                <p className="num mt-1.5 text-sm text-muted">
                  {formatTomanShort(form.monthlyRent)}
                </p>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <Label htmlFor="price" required hint="تومان">
                قیمت کل
              </Label>
              <Input
                id="price"
                value={form.price}
                onChange={(event) => set('price', digitsOnly(event.target.value))}
                inputMode="numeric"
                className="num"
                invalid={Boolean(errors.price)}
              />
              <p className="num mt-1.5 text-sm text-muted">{formatTomanShort(form.price)}</p>
              <FieldError message={errors.price} />
            </div>
          )}

          {/* نوع سند برای آگهی اجاره پرسیده نمی‌شود. */}
          {!isRental && (
            <ChoiceField
              id="edit-deedType"
              label="نوع سند"
              value={form.deedType}
              onChange={(value) => set('deedType', value)}
              options={DEED_TYPES}
            />
          )}
          {/* «قیمت توافقی» و «معاوضه» فقط برای آگهی خرید و فروش معنا دارند. */}
          {!isRental && (
            <>
              <div className="rounded border border-line px-4">
                <Toggle
                  id="edit-isNegotiable"
                  checked={form.isNegotiable}
                  onChange={(value) => set('isNegotiable', value)}
                  label="قیمت توافقی است"
                />
              </div>

              <div className="rounded border border-line px-4 sm:col-span-2">
                <Toggle
                  id="edit-exchangeable"
                  checked={form.exchangeable}
                  onChange={(value) => set('exchangeable', value)}
                  label="امکان معاوضه وجود دارد"
                />
              </div>
            </>
          )}

          <ExtraAmenities
            prefix="edit"
            amenities={amenities}
            selected={form.amenities}
            onToggle={(slug, checked) =>
              set(
                'amenities',
                checked
                  ? [...form.amenities, slug]
                  : form.amenities.filter((item) => item !== slug),
              )
            }
          />
        </div>
      </section>

      <section className="surface p-4 sm:p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">تصاویر و توضیحات</h2>

        <div className="mt-6">
          <Label
            htmlFor="description"
            required
            hint={`حداکثر ${toPersianDigits(DESCRIPTION_MAX)} کاراکتر`}
          >
            توضیحات ملک
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => set('description', event.target.value.slice(0, DESCRIPTION_MAX))}
            rows={9}
            invalid={Boolean(errors.description)}
          />
          <CharacterCounter length={form.description.length} max={DESCRIPTION_MAX} />
          <FieldError message={errors.description} />
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-brand">تصاویر ملک</p>
          <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
        </div>
      </section>

      {serverError && (
        <p
          role="alert"
          className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger"
        >
          {serverError}
        </p>
      )}

      {/* روی موبایل دکمه‌ها تمام‌عرض و چسبیده به پایین صفحه می‌مانند. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto">
          <Save className="h-5 w-5" />
          ذخیره تغییرات
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backHref)}
          className="w-full sm:w-auto"
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}
