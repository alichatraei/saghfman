'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Toggle } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/states';
import { useProfile, useTransactionTypes, useUpdateProfile } from '@/lib/hooks';
import { formatMobile } from '@/lib/format';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: transactionTypes } = useTransactionTypes();
  const update = useUpdateProfile();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [preferredTransaction, setPreferredTransaction] = useState('');
  const [notifyBySms, setNotifyBySms] = useState(true);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [notifyOnMatch, setNotifyOnMatch] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setEmail(profile.email ?? '');
    setCity(profile.city ?? '');
    setNotifyBySms(profile.notifyBySms);
    setNotifyByEmail(profile.notifyByEmail);
    setNotifyOnMatch(profile.notifyOnMatch);
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const submit = async () => {
    setError(undefined);
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('ایمیل وارد شده معتبر نیست.');
      return;
    }
    try {
      await update.mutateAsync({
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        preferredTransaction: preferredTransaction || undefined,
        notifyBySms,
        notifyByEmail,
        notifyOnMatch,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="space-y-6"
      noValidate
    >
      <section className="surface p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">اطلاعات شخصی</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone" hint="قابل تغییر نیست">
              شماره موبایل
            </Label>
            <Input
              id="phone"
              value={formatMobile(profile.phone)}
              disabled
              className="num"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              dir="ltr"
              inputMode="email"
              invalid={Boolean(error)}
            />
            <FieldError message={error} />
          </div>

          <div>
            <Label htmlFor="city">شهر</Label>
            <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="preferredTransaction">نوع معامله مورد علاقه</Label>
            <Select
              id="preferredTransaction"
              value={preferredTransaction}
              onChange={(event) => setPreferredTransaction(event.target.value)}
            >
              <option value="">انتخاب کنید</option>
              {transactionTypes?.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">اعلان‌ها</h2>
        <div className="mt-4 divide-y divide-line">
          <Toggle
            id="notifyBySms"
            checked={notifyBySms}
            onChange={setNotifyBySms}
            label="اطلاع‌رسانی پیامکی"
            description="نتیجه بررسی آگهی و اطلاعیه‌های مهم از طریق پیامک."
          />
          <Toggle
            id="notifyByEmail"
            checked={notifyByEmail}
            onChange={setNotifyByEmail}
            label="اطلاع‌رسانی ایمیلی"
          />
          <Toggle
            id="notifyOnMatch"
            checked={notifyOnMatch}
            onChange={setNotifyOnMatch}
            label="اطلاع از ملک‌های مشابه سلیقه من"
          />
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="gold-underline text-lg font-bold text-brand">حریم خصوصی</h2>
        <p className="mt-4 rounded bg-yellow-50 p-4 text-[15px] leading-8 text-muted">
          شماره موبایل شما در هیچ صفحه عمومی سایت نمایش داده نمی‌شود. متقاضیان تنها با شماره تماس
          شرکت ارتباط می‌گیرند و هماهنگی بازدید از طریق کارشناسان انجام می‌شود.
        </p>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={update.isPending}>
          <Save className="h-5 w-5" />
          ذخیره تغییرات
        </Button>
        {saved && <span className="text-sm text-success">تغییرات ذخیره شد.</span>}
      </div>
    </form>
  );
}
