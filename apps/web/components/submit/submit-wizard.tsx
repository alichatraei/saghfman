'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MyPropertyDto } from '@saghf/types';
import { Button } from '@/components/ui/button';
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
  Toggle,
} from '@/components/ui/field';
import { Stepper, STEPS } from './stepper';
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
} from './property-fields';
import { ImageUploader, type UploadedImage } from './image-uploader';
import { apiFetch, ApiError } from '@/lib/api';
import {
  useAmenities,
  useCities,
  useNeighborhoods,
  usePropertyTypes,
  useToken,
  useTransactionTypes,
} from '@/lib/hooks';
import { useAuthStore } from '@/lib/auth-store';
import { digitsOnly, formatTomanShort, toPersianDigits } from '@/lib/format';

interface FormState {
  title: string;
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
  description: string;
  images: UploadedImage[];
}

const EMPTY: FormState = {
  title: '',
  propertyType: '',
  transaction: '',
  city: '',
  neighborhood: '',
  address: '',
  displayAddress: '',
  showExactLocation: false,
  area: '',
  hallArea: '',
  landArea: '',
  rooms: '',
  bathrooms: '',
  floor: '',
  totalFloors: '',
  constructionYear: '',
  heating: '',
  cooling: '',
  cabinet: '',
  floorMaterial: '',
  wallMaterial: '',
  hasElevator: false,
  hasParking: false,
  hasStorage: false,
  hasTerrace: false,
  price: '',
  deposit: '',
  monthlyRent: '',
  isNegotiable: false,
  exchangeable: false,
  deedType: '',
  amenities: [],
  description: '',
  images: [],
};

const DRAFT_KEY = 'saghf-property-draft';

export function SubmitWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const token = useToken();
  const user = useAuthStore((state) => state.user);

  const { data: propertyTypes } = usePropertyTypes();
  const { data: transactionTypes } = useTransactionTypes();
  const { data: cities } = useCities();
  const { data: amenities } = useAmenities();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const [draftSaved, setDraftSaved] = useState(false);

  // محله‌ها همیشه به شهر انتخاب‌شده محدود می‌شوند.
  const { data: neighborhoods } = useNeighborhoods(undefined, form.city || undefined);

  // Restore an unfinished draft, then apply the intent from the home page.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(DRAFT_KEY) : null;
    if (stored) {
      try {
        setForm({ ...EMPTY, ...(JSON.parse(stored) as Partial<FormState>) });
      } catch {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    }
    const intent = params.get('transaction');
    if (intent) setForm((state) => ({ ...state, transaction: intent }));
  }, [params]);

  const isRental = RENTAL_TRANSACTIONS.includes(form.transaction);
  const showsLandArea = LAND_AREA_TYPES.includes(form.propertyType);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((state) => ({ ...state, [key]: value }));
    setErrors((state) => ({ ...state, [key]: undefined }));
  };

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const validateStep = (index: number): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (index === 0) {
      if (form.title.trim().length < 10) next.title = 'عنوان باید حداقل ۱۰ کاراکتر باشد.';
      if (form.title.trim().length > TITLE_MAX)
        next.title = `عنوان نباید بیشتر از ${TITLE_MAX} کاراکتر باشد.`;
      if (!form.propertyType) next.propertyType = 'نوع ملک را انتخاب کنید.';
      if (!form.transaction) next.transaction = 'نوع آگهی را انتخاب کنید.';
      if (!form.city) next.city = 'شهر را انتخاب کنید.';
      if (!form.neighborhood) next.neighborhood = 'محله را انتخاب کنید.';
      if (form.address.trim().length < 5) next.address = 'نام منطقه و خیابان ملک را وارد کنید.';
      if (!form.area || Number(form.area) < 10) next.area = 'متراژ را وارد کنید (حداقل ۱۰ متر).';
      if (form.rooms === '') next.rooms = 'تعداد اتاق را وارد کنید.';
      // برای آگهی اجاره، مشخص بودن طبقه الزامی است.
      if (isRental && form.floor === '') next.floor = 'برای آگهی اجاره، طبقه ملک را وارد کنید.';
    }

    if (index === 1) {
      if (isRental && !form.deposit && !form.monthlyRent) {
        next.deposit = 'مبلغ ودیعه یا اجاره ماهانه را وارد کنید.';
      }
      if (!isRental && !form.price) next.price = 'قیمت کل را وارد کنید.';
    }

    if (index === 2) {
      if (form.description.trim().length > DESCRIPTION_MAX)
        next.description = `توضیحات نباید بیشتر از ${DESCRIPTION_MAX} کاراکتر باشد.`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((value) => Math.max(0, value - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (!validateStep(2)) return;
    if (!token) {
      router.push('/auth?next=/submit-property');
      return;
    }

    setSubmitting(true);
    setServerError(undefined);
    try {
      await apiFetch<MyPropertyDto>('/properties', {
        method: 'POST',
        token,
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          propertyType: form.propertyType,
          transaction: form.transaction,
          neighborhood: form.neighborhood,
          address: form.address.trim(),
          displayAddress: form.displayAddress.trim() || undefined,
          // آگهی اجاره روی نقشه پین نمی‌شود؛ فقط منطقه و خیابان ثبت می‌شود.
          showExactLocation: isRental ? false : form.showExactLocation,
          area: Number(form.area),
          hallArea: form.hallArea ? Number(form.hallArea) : undefined,
          landArea: showsLandArea && form.landArea ? Number(form.landArea) : undefined,
          rooms: Number(form.rooms || 0),
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          floor: form.floor !== '' ? Number(form.floor) : undefined,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
          constructionYear: form.constructionYear ? Number(form.constructionYear) : undefined,
          parkingCount: form.hasParking ? 1 : 0,
          hasElevator: form.hasElevator,
          hasStorage: form.hasStorage,
          hasBalcony: form.hasTerrace,
          heating: form.heating || undefined,
          cooling: form.cooling || undefined,
          cabinet: form.cabinet || undefined,
          floorMaterial: form.floorMaterial || undefined,
          wallMaterial: form.wallMaterial || undefined,
          // نوع سند فقط برای آگهی‌های خرید و فروش معنا دارد.
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
      window.localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'ثبت آگهی با خطا مواجه شد.');
    } finally {
      setSubmitting(false);
    }
  };

  const priceSummary = useMemo(() => {
    if (isRental) {
      const parts: string[] = [];
      if (form.deposit) parts.push(`ودیعه ${formatTomanShort(form.deposit)}`);
      if (form.monthlyRent) parts.push(`اجاره ${formatTomanShort(form.monthlyRent)}`);
      return parts.join(' — ') || '—';
    }
    return form.price ? formatTomanShort(form.price) : '—';
  }, [form.deposit, form.monthlyRent, form.price, isRental]);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        className="
        flex
        flex-col
        items-center
        gap-4
        rounded-[var(--radius-lg)]
        border
        border-[var(--green-200)]
        bg-white
        px-6
        py-16
        text-center
        shadow-[var(--shadow-card)]
      "
      >
        <span
          className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          border
          border-[var(--green-200)]
          bg-[var(--green-soft)]
          text-[var(--green-700)]
        "
        >
          <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
        </span>

        <h2 className="text-xl font-bold text-[var(--navy)]">آگهی شما ثبت شد</h2>

        <p
          className="
          max-w-lg
          text-[15px]
          leading-8
          text-[var(--text-secondary)]
        "
        >
          آگهی شما با موفقیت ثبت شد و پس از بررسی کارشناسان منتشر می‌شود. نتیجه بررسی از طریق پیامک
          به شما اطلاع داده خواهد شد.
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link
            href="/account/listings"
            className="
            inline-flex
            h-12
            items-center
            justify-center
            rounded-[var(--radius-md)]
            bg-[var(--navy)]
            px-7
            font-medium
            text-white
            transition-colors
            hover:bg-[var(--navy-alt)]
          "
          >
            مشاهده آگهی‌های من
          </Link>

          <button
            type="button"
            onClick={() => {
              setForm(EMPTY);
              setStep(0);
              setSubmitted(false);
            }}
            className="
            inline-flex
            h-12
            items-center
            justify-center
            rounded-[var(--radius-md)]
            border
            border-[var(--line)]
            bg-white
            px-7
            font-medium
            text-[var(--navy)]
            transition-all

            hover:border-[var(--green-300)]
            hover:bg-[var(--green-50)]
          "
          >
            ثبت آگهی جدید
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <Stepper current={step} />

      {!user && (
        <div
          className="
      mb-5
      rounded-[var(--radius-md)]
      border
      border-[var(--green-200)]
      bg-[var(--green-soft)]
      px-5
      py-4
      text-sm
      leading-7
      text-[var(--navy)]
    "
        >
          <span className="font-semibold">برای ثبت نهایی آگهی باید وارد حساب کاربری شوید.</span>{' '}
          می‌توانید فرم را کامل کنید؛ در گام آخر وارد شوید.
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step === STEPS.length - 1) void submit();
          else goNext();
        }}
        noValidate
      >
        <motion.section
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="
  rounded-[var(--radius-lg)]
  border
  border-[var(--line)]
  bg-white
  p-5
  shadow-[var(--shadow-card)]
  sm:p-6
  lg:p-8
"
          aria-label={STEPS[step]}
        >
          {step === 0 && (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
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
                  placeholder="مثلاً: آپارتمان ۱۲۵ متری شهرک غرب"
                />
                <p className="num mt-1.5 text-sm text-muted">
                  {toPersianDigits(form.title.length)} از {toPersianDigits(TITLE_MAX)} کاراکتر
                </p>
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
                  invalid={Boolean(errors.propertyType)}
                >
                  <option value="">انتخاب کنید</option>
                  {propertyTypes?.map((type) => (
                    <option key={type.slug} value={type.slug}>
                      {type.title}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.propertyType} />
              </div>

              <div>
                <Label htmlFor="transaction" required>
                  نوع آگهی
                </Label>
                <Select
                  id="transaction"
                  value={form.transaction}
                  onChange={(event) => set('transaction', event.target.value)}
                  invalid={Boolean(errors.transaction)}
                >
                  <option value="">انتخاب کنید</option>
                  {transactionTypes?.map((type) => (
                    <option key={type.slug} value={type.slug}>
                      {type.title}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.transaction} />
              </div>

              <div>
                <Label htmlFor="city" required>
                  شهر
                </Label>
                <Select
                  id="city"
                  value={form.city}
                  onChange={(event) => {
                    // محله‌ها وابسته به شهرند، پس با تغییر شهر انتخاب قبلی پاک می‌شود.
                    setForm((state) => ({ ...state, city: event.target.value, neighborhood: '' }));
                    setErrors((state) => ({ ...state, city: undefined, neighborhood: undefined }));
                  }}
                  invalid={Boolean(errors.city)}
                >
                  <option value="">انتخاب کنید</option>
                  {cities?.map((item) => (
                    <option key={item.city} value={item.city}>
                      {item.city}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.city} />
              </div>

              <div>
                <Label
                  htmlFor="neighborhood"
                  required
                  hint={form.city ? undefined : 'ابتدا شهر را انتخاب کنید'}
                >
                  محله
                </Label>
                <Select
                  id="neighborhood"
                  value={form.neighborhood}
                  onChange={(event) => set('neighborhood', event.target.value)}
                  invalid={Boolean(errors.neighborhood)}
                  disabled={!form.city}
                >
                  <option value="">{form.city ? 'انتخاب کنید' : 'ابتدا شهر را انتخاب کنید'}</option>
                  {neighborhoods?.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.neighborhood} />
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

              <RoomsField
                id="rooms"
                value={form.rooms}
                onChange={(value) => set('rooms', value)}
                error={errors.rooms}
              />

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
                label="تعداد سرویس بهداشتی"
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
                label="تعداد کل طبقات"
                value={form.totalFloors}
                onChange={(value) => set('totalFloors', value)}
              />

              <NumberField
                id="constructionYear"
                label="سال ساخت"
                hint="شمسی، مثلاً ۱۳۹۸"
                value={form.constructionYear}
                onChange={(value) => set('constructionYear', value)}
                maxLength={4}
              />

              <ChoiceField
                id="heating"
                label="گرمایش"
                value={form.heating}
                onChange={(value) => set('heating', value)}
                options={HEATING_OPTIONS}
              />

              <ChoiceField
                id="cooling"
                label="سرمایش"
                value={form.cooling}
                onChange={(value) => set('cooling', value)}
                options={COOLING_OPTIONS}
              />

              <ChoiceField
                id="cabinet"
                label="جنس کابینت"
                value={form.cabinet}
                onChange={(value) => set('cabinet', value)}
                options={CABINET_OPTIONS}
              />

              <ChoiceField
                id="floorMaterial"
                label="کف‌پوش"
                value={form.floorMaterial}
                onChange={(value) => set('floorMaterial', value)}
                options={FLOOR_OPTIONS}
              />

              <ChoiceField
                id="wallMaterial"
                label="پوشش دیوار"
                value={form.wallMaterial}
                onChange={(value) => set('wallMaterial', value)}
                options={WALL_OPTIONS}
              />

              <YesNoField
                id="hasElevator"
                label="آسانسور"
                checked={form.hasElevator}
                onChange={(value) => set('hasElevator', value)}
              />

              <YesNoField
                id="hasParking"
                label="پارکینگ"
                checked={form.hasParking}
                onChange={(value) => set('hasParking', value)}
              />

              <YesNoField
                id="hasStorage"
                label="انباری"
                checked={form.hasStorage}
                onChange={(value) => set('hasStorage', value)}
              />

              <YesNoField
                id="hasTerrace"
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
                  placeholder={
                    isRental ? 'مثلاً: اصفهان، مرداویج، خیابان سعادت‌آباد' : 'اصفهان، خیابان …، کوچه …، پلاک …'
                  }
                />
                <FieldError message={errors.address} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="displayAddress" hint="اختیاری — همین متن روی آگهی دیده می‌شود">
                  آدرس نمایشی
                </Label>
                <Input
                  id="displayAddress"
                  value={form.displayAddress}
                  onChange={(event) => set('displayAddress', event.target.value)}
                  placeholder="اصفهان، مرداویج"
                />
              </div>

              {/* آگهی اجاره روی نقشه پین نمی‌شود؛ فقط منطقه و خیابان ثبت می‌شود. */}
              {!isRental && (
                <div className="md:col-span-2">
                  <YesNoField
                    id="showExactLocation"
                    label="نمایش موقعیت دقیق روی نقشه"
                    description="اگر غیرفعال باشد فقط محله ملک روی نقشه نشان داده می‌شود."
                    checked={form.showExactLocation}
                    onChange={(value) => set('showExactLocation', value)}
                  />
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {isRental ? (
                <>
                  <div>
                    <Label htmlFor="deposit" required hint="تومان">
                      مبلغ ودیعه (رهن)
                    </Label>
                    <Input
                      id="deposit"
                      value={form.deposit}
                      onChange={(event) => set('deposit', digitsOnly(event.target.value))}
                      inputMode="numeric"
                      invalid={Boolean(errors.deposit)}
                      className="num"
                    />
                    <p className="num mt-1.5 text-sm text-muted">
                      {formatTomanShort(form.deposit)}
                    </p>
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
                    invalid={Boolean(errors.price)}
                    className="num"
                  />
                  <p className="num mt-1.5 text-sm text-muted">{formatTomanShort(form.price)}</p>
                  <FieldError message={errors.price} />
                </div>
              )}

              {/* نوع سند برای آگهی اجاره پرسیده نمی‌شود. */}
              {!isRental && (
                <ChoiceField
                  id="deedType"
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
                      id="isNegotiable"
                      checked={form.isNegotiable}
                      onChange={(value) => set('isNegotiable', value)}
                      label="قیمت توافقی است"
                    />
                  </div>

                  <div className="rounded border border-line px-4 md:col-span-2">
                    <Toggle
                      id="exchangeable"
                      checked={form.exchangeable}
                      onChange={(value) => set('exchangeable', value)}
                      label="امکان معاوضه وجود دارد"
                    />
                  </div>
                </>
              )}

              <ExtraAmenities
                prefix="submit"
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
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
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
                  invalid={Boolean(errors.description)}
                  placeholder="ویژگی‌های ملک، وضعیت بازسازی، دسترسی‌ها و هر نکته‌ای که برای متقاضی مهم است."
                  rows={8}
                />
                <CharacterCounter length={form.description.length} max={DESCRIPTION_MAX} />
                <FieldError message={errors.description} />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-brand">تصاویر ملک</p>
                <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
              </div>

              <section className="rounded border border-line bg-cream-soft p-5">
                <h3 className="text-[15px] font-bold text-brand">پیش‌نمایش آگهی</h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <PreviewItem label="عنوان" value={form.title || '—'} />
                  <PreviewItem
                    label="نوع"
                    value={
                      propertyTypes?.find((type) => type.slug === form.propertyType)?.title ?? '—'
                    }
                  />
                  <PreviewItem
                    label="متراژ"
                    value={form.area ? `${toPersianDigits(form.area)} متر` : '—'}
                  />
                  <PreviewItem label="قیمت" value={priceSummary} />
                </dl>
              </section>

              {serverError && (
                <p
                  role="alert"
                  className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger"
                >
                  {serverError}
                </p>
              )}
            </div>
          )}
        </motion.section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowRight className="h-4 w-4" />
                مرحله قبل
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={saveDraft}>
              <Save className="h-4 w-4" />
              {draftSaved ? 'پیش‌نویس ذخیره شد' : 'ذخیره پیش‌نویس'}
            </Button>
          </div>

          <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto">
            {step === STEPS.length - 1 ? 'ثبت نهایی آگهی' : 'مرحله بعد'}
            {step < STEPS.length - 1 && <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="num mt-1 font-medium text-brand">{value}</dd>
    </div>
  );
}
