'use client';

import { useEffect, useState } from 'react';
import { Clock3, MessageCircle, Phone, Save, Send, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CompanyContactDto } from '@saghf/types';

import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/states';

import { apiFetch } from '@/lib/api';
import { useCompanyContact, useToken } from '@/lib/hooks';

import { toPersianDigits } from '@/lib/format';

/** Messaging channels the company can publish next to its phone number. */
const SOCIAL_FIELDS = [
  {
    key: 'telegram' as const,
    label: 'تلگرام',
    hint: 'آی‌دی یا لینک',
    placeholder: '@saghfman یا https://t.me/saghfman',
  },
  {
    key: 'whatsappLink' as const,
    label: 'لینک واتساپ',
    hint: 'اختیاری — جدا از شماره واتساپ',
    placeholder: 'https://wa.me/989120000000',
  },
  {
    key: 'rubika' as const,
    label: 'روبیکا',
    hint: 'آی‌دی یا لینک',
    placeholder: 'https://rubika.ir/saghfman',
  },
  {
    key: 'bale' as const,
    label: 'بله',
    hint: 'آی‌دی یا لینک',
    placeholder: 'https://ble.ir/saghfman',
  },
  {
    key: 'eitaa' as const,
    label: 'ایتا',
    hint: 'آی‌دی یا لینک',
    placeholder: 'https://eitaa.com/saghfman',
  },
  {
    key: 'instagram' as const,
    label: 'اینستاگرام',
    hint: 'آی‌دی یا لینک',
    placeholder: 'https://instagram.com/saghfman',
  },
];

export default function AdminContactSettingsPage() {
  const token = useToken();
  const queryClient = useQueryClient();

  const { data, isLoading } = useCompanyContact();

  const [form, setForm] = useState({
    companyName: '',
    tagline: '',
    primaryPhone: '',
    secondaryPhone: '',
    whatsapp: '',
    messengerPhone: '',
    workingHours: '',
    telegram: '',
    whatsappLink: '',
    rubika: '',
    bale: '',
    eitaa: '',
    instagram: '',
  });

  const [error, setError] = useState<string | undefined>();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;

    setForm({
      companyName: data.companyName,
      tagline: data.tagline ?? '',
      primaryPhone: data.primaryPhone,
      secondaryPhone: data.secondaryPhone ?? '',
      whatsapp: data.whatsapp ?? '',
      messengerPhone: data.messengerPhone ?? '',
      workingHours: data.workingHours ?? '',
      telegram: data.socials?.telegram ?? '',
      whatsappLink: data.socials?.whatsappLink ?? '',
      rubika: data.socials?.rubika ?? '',
      bale: data.socials?.bale ?? '',
      eitaa: data.socials?.eitaa ?? '',
      instagram: data.socials?.instagram ?? '',
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  const submit = async () => {
    setError(undefined);

    if (form.primaryPhone.trim().length < 6) {
      setError('شماره تماس اصلی شرکت را وارد کنید.');
      return;
    }

    setSaving(true);

    try {
      await apiFetch<CompanyContactDto>('/admin/settings/contact', {
        method: 'PATCH',
        token,
        body: {
          companyName: form.companyName.trim(),

          tagline: form.tagline.trim() || undefined,

          primaryPhone: form.primaryPhone.trim(),

          secondaryPhone: form.secondaryPhone.trim() || undefined,

          whatsapp: form.whatsapp.trim() || undefined,

          messengerPhone: form.messengerPhone.trim() || undefined,

          workingHours: form.workingHours.trim() || undefined,

          telegram: form.telegram.trim() || undefined,

          whatsappLink: form.whatsappLink.trim() || undefined,

          rubika: form.rubika.trim() || undefined,

          bale: form.bale.trim() || undefined,

          eitaa: form.eitaa.trim() || undefined,

          instagram: form.instagram.trim() || undefined,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: ['company-contact'],
      });

      setSaved(true);

      setTimeout(() => setSaved(false), 2500);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-4xl
        space-y-6
      "
    >
      {/* =========================
          Header
      ========================== */}

      <div>
        <h1
          className="
            text-xl
            font-bold
            text-[var(--navy)]

            sm:text-2xl
          "
        >
          تنظیمات تماس شرکت
        </h1>

        <p
          className="
            mt-1
            text-sm
            leading-7
            text-[var(--text-secondary)]
          "
        >
          اطلاعات تماس عمومی شرکت را از این بخش مدیریت کنید.
        </p>
      </div>

      {/* =========================
          Privacy notice
      ========================== */}

      <div
        className="
          flex
          items-start
          gap-3

          rounded-[var(--radius-md)]
          border
          border-[var(--green-200)]
          bg-[var(--green-soft)]

          px-4
          py-4

          text-sm
          leading-7
          text-[var(--navy)]

          sm:px-5
          sm:text-[15px]
          sm:leading-8
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-full

            bg-white
            text-[var(--green-700)]

            shadow-[var(--shadow-xs)]
          "
        >
          <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>

        <p>
          این شماره‌ها روی تمام صفحات عمومی و در بخش «تماس با شرکت» هر آگهی نمایش داده می‌شوند.
          <strong className="font-semibold"> شماره مالکان هرگز منتشر نمی‌شود.</strong>
        </p>
      </div>

      {/* =========================
          Form
      ========================== */}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
        className="
          overflow-hidden

          rounded-[var(--radius-lg)]
          border
          border-[var(--line)]
          bg-white

          shadow-[var(--shadow-card)]
        "
      >
        {/* Form body */}
        <div
          className="
            p-4
            sm:p-6
            lg:p-8
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-5

              md:grid-cols-2
              md:gap-x-6
            "
          >
            {/* Company */}
            <div>
              <Label htmlFor="companyName" required>
                نام شرکت
              </Label>

              <Input
                id="companyName"
                value={form.companyName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    companyName: event.target.value,
                  })
                }
                placeholder="نام شرکت"
              />
            </div>

            {/* Tagline */}
            <div>
              <Label htmlFor="tagline">شعار / زیرعنوان</Label>

              <Input
                id="tagline"
                value={form.tagline}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tagline: event.target.value,
                  })
                }
                placeholder="مثلاً همراه مطمئن شما در معاملات ملکی"
              />
            </div>

            {/* Primary phone */}
            <div>
              <Label htmlFor="primaryPhone" required hint="مثلاً ۰۲۱-۹۱۰۰۱۲۳۴">
                شماره تماس اصلی
              </Label>

              <Input
                id="primaryPhone"
                value={form.primaryPhone}
                onChange={(event) => {
                  setForm({
                    ...form,
                    primaryPhone: event.target.value,
                  });

                  if (error) {
                    setError(undefined);
                  }
                }}
                dir="ltr"
                inputMode="tel"
                className="num text-left"
                invalid={Boolean(error)}
                placeholder="02191001234"
              />

              <FieldError message={error} />
            </div>

            {/* Secondary phone */}
            <div>
              <Label htmlFor="secondaryPhone">شماره تماس دوم</Label>

              <Input
                id="secondaryPhone"
                value={form.secondaryPhone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    secondaryPhone: event.target.value,
                  })
                }
                dir="ltr"
                inputMode="tel"
                className="num text-left"
                placeholder="02100000000"
              />
            </div>

            {/* Whatsapp */}
            <div>
              <Label htmlFor="whatsapp" hint="با کد کشور">
                واتساپ
              </Label>

              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(event) =>
                  setForm({
                    ...form,
                    whatsapp: event.target.value,
                  })
                }
                dir="ltr"
                inputMode="tel"
                className="num text-left"
                placeholder="989120000000"
              />
            </div>

            {/* Messenger phone */}
            <div>
              <Label htmlFor="messengerPhone" hint="روی صفحه آگهی نمایش داده می‌شود">
                تلفن پیام‌رسان
              </Label>

              <Input
                id="messengerPhone"
                value={form.messengerPhone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    messengerPhone: event.target.value,
                  })
                }
                dir="ltr"
                inputMode="tel"
                className="num text-left"
                placeholder="09120000000"
              />
            </div>

            {/* Working hours */}
            <div>
              <Label htmlFor="workingHours">ساعات پاسخگویی</Label>

              <Input
                id="workingHours"
                value={form.workingHours}
                onChange={(event) =>
                  setForm({
                    ...form,
                    workingHours: event.target.value,
                  })
                }
                placeholder="شنبه تا پنجشنبه، ۹ تا ۱۸"
              />
            </div>
          </div>

          {/* =========================
              Messaging channels
          ========================== */}

          <div className="mt-8">
            <div className="flex items-center gap-2">
              <Send className="h-[18px] w-[18px] text-[var(--green-700)]" strokeWidth={1.9} />
              <h2 className="text-[15px] font-semibold text-[var(--navy)]">
                شبکه‌های اجتماعی و پیام‌رسان‌ها
              </h2>
            </div>

            <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">
              می‌توانید لینک کامل یا آی‌دی هر پیام‌رسان را وارد کنید. هر موردی که پر شود، در فوتر
              سایت و کارت تماس آگهی‌ها نمایش داده می‌شود.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key} hint={field.hint}>
                    {field.label}
                  </Label>

                  <Input
                    id={field.key}
                    value={form[field.key]}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [field.key]: event.target.value,
                      })
                    }
                    dir="ltr"
                    className="text-left"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* =========================
              Preview
          ========================== */}

          <section
            className="
              mt-7

              rounded-[var(--radius-md)]
              border
              border-[var(--green-200)]
              bg-[var(--green-50)]

              p-4
              sm:p-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-1

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[var(--navy)]
                  "
                >
                  پیش‌نمایش کارت تماس
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-[var(--text-muted)]
                  "
                >
                  اطلاعاتی که کاربران در صفحه آگهی مشاهده می‌کنند
                </p>
              </div>

              <span
                className="
                  mt-2
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5

                  rounded-full

                  bg-[var(--green-soft)]

                  px-3
                  py-1

                  text-xs
                  font-medium
                  text-[var(--green-700)]

                  sm:mt-0
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                اطلاعات شرکت
              </span>
            </div>

            <div
              className="
                mt-5

                grid
                grid-cols-1
                gap-3

                sm:grid-cols-2
              "
            >
              {/* Phone */}
              <ContactPreviewItem icon={<Phone className="h-5 w-5" />} label="شماره تماس">
                <span
                  dir="ltr"
                  className="
                    num
                    block
                    text-left
                    text-lg
                    font-bold
                    text-[var(--navy)]

                    sm:text-xl
                  "
                >
                  {toPersianDigits(form.primaryPhone || '—')}
                </span>
              </ContactPreviewItem>

              {/* Hours */}
              <ContactPreviewItem icon={<Clock3 className="h-5 w-5" />} label="ساعات پاسخگویی">
                <span
                  className="
                    text-sm
                    font-medium
                    text-[var(--navy)]
                  "
                >
                  {form.workingHours || 'ثبت نشده است'}
                </span>
              </ContactPreviewItem>

              {/* WhatsApp */}
              {form.whatsapp && (
                <ContactPreviewItem
                  icon={<MessageCircle className="h-5 w-5" />}
                  label="واتساپ"
                  className="
                    sm:col-span-2
                  "
                >
                  <span
                    dir="ltr"
                    className="
                      num
                      text-sm
                      font-medium
                      text-[var(--green-700)]
                    "
                  >
                    +{toPersianDigits(form.whatsapp.replace(/^\+/, ''))}
                  </span>
                </ContactPreviewItem>
              )}
            </div>
          </section>
        </div>

        {/* =========================
            Footer Actions
        ========================== */}

        <div
          className="
            flex
            flex-col
            gap-3

            border-t
            border-[var(--line)]

            bg-[var(--surface-soft)]

            p-4

            sm:flex-row
            sm:items-center
            sm:justify-between

            sm:px-6
            sm:py-5

            lg:px-8
          "
        >
          <Button
            type="submit"
            size="lg"
            variant="accent"
            loading={saving}
            className="
              w-full
              sm:w-auto
            "
          >
            <Save className="h-5 w-5" strokeWidth={1.8} />
            ذخیره تنظیمات
          </Button>

          <div
            aria-live="polite"
            className="
              min-h-6
              text-center
              text-sm
              sm:text-start
            "
          >
            {saved && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  font-medium
                  text-[var(--success)]
                "
              >
                <ShieldCheck className="h-4 w-4" />
                تنظیمات با موفقیت ذخیره شد.
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   Preview Item
========================================================= */

function ContactPreviewItem({
  icon,
  label,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3

        rounded-[var(--radius-sm)]

        border
        border-[var(--line-soft)]

        bg-white

        p-3.5

        ${className}
      `}
    >
      <span
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          rounded-full

          bg-[var(--green-soft)]
          text-[var(--green-700)]
        "
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-[11px]
            text-[var(--text-muted)]
          "
        >
          {label}
        </p>

        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
