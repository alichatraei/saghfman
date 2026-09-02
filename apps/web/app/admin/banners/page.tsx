'use client';

import { useState } from 'react';
import { Megaphone, Plus, Save, Trash2, Pencil, X } from 'lucide-react';
import type { AdminBannerDto } from '@saghf/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Textarea, Toggle } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useAdminBanners, useBannerMutation } from '@/lib/hooks';
import { formatJalali, toPersianDigits } from '@/lib/format';

const VARIANTS = [
  { value: 'info', label: 'اطلاع‌رسانی (خنثی)' },
  { value: 'success', label: 'موفقیت (سبز)' },
  { value: 'warning', label: 'هشدار (زرد)' },
  { value: 'promo', label: 'تبلیغاتی (طلایی)' },
];

interface BannerForm {
  title: string;
  message: string;
  variant: string;
  ctaLabel: string;
  linkUrl: string;
  isActive: boolean;
  dismissible: boolean;
  order: string;
  startsAt: string;
  endsAt: string;
}

const EMPTY: BannerForm = {
  title: '',
  message: '',
  variant: 'info',
  ctaLabel: '',
  linkUrl: '',
  isActive: true,
  dismissible: true,
  order: '0',
  startsAt: '',
  endsAt: '',
};

/** ISO ⇄ value of <input type="datetime-local"> (which has no timezone). */
const toInputValue = (iso: string | null): string =>
  iso ? new Date(iso).toISOString().slice(0, 16) : '';

export default function AdminBannersPage() {
  const { data, isLoading, isError, error, refetch } = useAdminBanners();
  const mutation = useBannerMutation();

  const [editing, setEditing] = useState<AdminBannerDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [formError, setFormError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<AdminBannerDto | null>(null);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setFormError(undefined);
    setCreating(true);
  };

  const openEdit = (banner: AdminBannerDto) => {
    setForm({
      title: banner.title,
      message: banner.message ?? '',
      variant: banner.variant,
      ctaLabel: banner.ctaLabel ?? '',
      linkUrl: banner.linkUrl ?? '',
      isActive: banner.isActive,
      dismissible: banner.dismissible,
      order: String(banner.order),
      startsAt: toInputValue(banner.startsAt),
      endsAt: toInputValue(banner.endsAt),
    });
    setEditing(banner);
    setFormError(undefined);
    setCreating(true);
  };

  const submit = async () => {
    setFormError(undefined);
    if (form.title.trim().length < 3) {
      setFormError('عنوان بنر را وارد کنید (حداقل ۳ کاراکتر).');
      return;
    }
    if (form.startsAt && form.endsAt && form.startsAt > form.endsAt) {
      setFormError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      variant: form.variant,
      ctaLabel: form.ctaLabel.trim(),
      linkUrl: form.linkUrl.trim(),
      isActive: form.isActive,
      dismissible: form.dismissible,
      order: Number(form.order || 0),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : '',
    };

    try {
      await mutation.mutateAsync(
        editing
          ? { id: editing.id, action: 'update', payload }
          : { action: 'create', payload },
      );
      setCreating(false);
      setEditing(null);
    } catch (submitError) {
      setFormError((submitError as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--navy)] sm:text-2xl">بنر صفحه اصلی</h1>
          <p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">
            متن، رنگ، لینک و بازه زمانی نمایش بنر بالای صفحه اصلی را از اینجا تنظیم کنید.
          </p>
        </div>

        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-5 w-5" />
          بنر جدید
        </Button>
      </div>

      {isError && <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={<Megaphone className="h-7 w-7" />}
          title="هنوز بنری ساخته نشده است"
          description="با ساخت اولین بنر، یک پیام در بالای صفحه اصلی به بازدیدکنندگان نشان دهید."
        />
      )}

      <ul className="space-y-3">
        {data?.map((banner) => (
          <li key={banner.id} className="surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-bold text-[var(--navy)]">{banner.title}</h2>
                  <Badge tone={banner.isLive ? 'success' : 'muted'}>
                    {banner.isLive ? 'در حال نمایش' : banner.isActive ? 'خارج از بازه' : 'غیرفعال'}
                  </Badge>
                  <Badge tone="info">
                    {VARIANTS.find((item) => item.value === banner.variant)?.label ?? banner.variant}
                  </Badge>
                </div>

                {banner.message && (
                  <p className="mt-2 text-sm leading-7 text-muted">{banner.message}</p>
                )}

                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
                  <div className="flex gap-1">
                    <dt>شروع:</dt>
                    <dd className="num">
                      {banner.startsAt ? formatJalali(banner.startsAt,"numeric") : 'بدون محدودیت'}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>پایان:</dt>
                    <dd className="num">
                      {banner.endsAt ? formatJalali(banner.endsAt,"numeric") : 'بدون انقضا'}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>ترتیب:</dt>
                    <dd className="num">{toPersianDigits(banner.order)}</dd>
                  </div>
                  {banner.linkUrl && (
                    <div className="flex min-w-0 gap-1">
                      <dt>لینک:</dt>
                      <dd className="truncate" dir="ltr">
                        {banner.linkUrl}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={() =>
                    mutation.mutate({
                      id: banner.id,
                      action: 'update',
                      payload: { isActive: !banner.isActive },
                    })
                  }
                >
                  {banner.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={() => openEdit(banner)}
                >
                  <Pencil className="h-4 w-4" />
                  ویرایش
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="col-span-2 w-full text-danger md:w-auto"
                  onClick={() => setDeleting(banner)}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={editing ? 'ویرایش بنر' : 'بنر جدید'}
        footer={
          <>
            <Button loading={mutation.isPending} onClick={() => void submit()}>
              <Save className="h-5 w-5" />
              ذخیره بنر
            </Button>
            <Button variant="outline" onClick={() => setCreating(false)}>
              <X className="h-4 w-4" />
              انصراف
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="banner-title" required>
              عنوان
            </Label>
            <Input
              id="banner-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              invalid={Boolean(formError)}
              placeholder="مثلاً: تخفیف ویژه کمیسیون تا پایان مهر"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="banner-message" hint="حداکثر ۴۰۰ کاراکتر">
              متن بنر
            </Label>
            <Textarea
              id="banner-message"
              rows={3}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value.slice(0, 400) })}
            />
          </div>

          <div>
            <Label htmlFor="banner-variant">نوع نمایش</Label>
            <Select
              id="banner-variant"
              value={form.variant}
              onChange={(event) => setForm({ ...form, variant: event.target.value })}
            >
              {VARIANTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="banner-order" hint="عدد کوچک‌تر بالاتر">
              ترتیب نمایش
            </Label>
            <Input
              id="banner-order"
              value={form.order}
              onChange={(event) => setForm({ ...form, order: event.target.value.replace(/\D/g, '') })}
              inputMode="numeric"
              className="num"
            />
          </div>

          <div>
            <Label htmlFor="banner-cta">متن دکمه</Label>
            <Input
              id="banner-cta"
              value={form.ctaLabel}
              onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })}
              placeholder="مشاهده آگهی‌ها"
            />
          </div>

          <div>
            <Label htmlFor="banner-link">لینک دکمه</Label>
            <Input
              id="banner-link"
              value={form.linkUrl}
              onChange={(event) => setForm({ ...form, linkUrl: event.target.value })}
              dir="ltr"
              className="text-left"
              placeholder="/properties?transaction=rent"
            />
          </div>

          <div>
            <Label htmlFor="banner-starts" hint="خالی یعنی از همین حالا">
              شروع نمایش
            </Label>
            <Input
              id="banner-starts"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div>
            <Label htmlFor="banner-ends" hint="خالی یعنی بدون انقضا">
              پایان نمایش
            </Label>
            <Input
              id="banner-ends"
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--line)] px-4">
            <Toggle
              id="banner-active"
              checked={form.isActive}
              onChange={(value) => setForm({ ...form, isActive: value })}
              label="فعال باشد"
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--line)] px-4">
            <Toggle
              id="banner-dismissible"
              checked={form.dismissible}
              onChange={(value) => setForm({ ...form, dismissible: value })}
              label="کاربر بتواند ببندد"
            />
          </div>

          <div className="sm:col-span-2">
            <FieldError message={formError} />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="حذف بنر"
        footer={
          <>
            <Button
              variant="danger"
              loading={mutation.isPending}
              onClick={() => {
                if (deleting) mutation.mutate({ id: deleting.id, action: 'delete' });
                setDeleting(null);
              }}
            >
              حذف کن
            </Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              انصراف
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-8 text-muted">
          بنر «{deleting?.title}» برای همیشه حذف می‌شود.
        </p>
      </Modal>
    </div>
  );
}
