'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Smartphone } from 'lucide-react';
import type { AuthTokensDto, RequestOtpResponse } from '@saghf/types';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/field';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { digitsOnly, formatMobile, toPersianDigits } from '@/lib/format';

const PHONE_PATTERN = /^09\d{9}$/;

export function AuthPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/account/listings';
  const setSession = useAuthStore((state) => state.setSession);

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const requestOtp = async (resend = false) => {
    setError(undefined);
    if (!PHONE_PATTERN.test(digitsOnly(phone))) {
      setError('شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch<RequestOtpResponse>('/auth/request-otp', {
        method: 'POST',
        body: { phone: digitsOnly(phone) },
      });
      setStep('code');
      setSecondsLeft(response.resendAfterSeconds);
      setNotice(
        response.devCode
          ? `کد آزمایشی (حالت توسعه): ${toPersianDigits(response.devCode)}`
          : resend
            ? 'کد جدید برای شما ارسال شد.'
            : undefined,
      );
      setTimeout(() => codeRef.current?.focus(), 80);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : 'ارسال کد با خطا مواجه شد.',
      );
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError(undefined);
    if (digitsOnly(code).length < 4) {
      setError('کد ارسال‌شده را کامل وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const session = await apiFetch<AuthTokensDto>('/auth/verify-otp', {
        method: 'POST',
        body: { phone: digitsOnly(phone), code: digitsOnly(code) },
      });
      setSession(session);
      router.push(next);
      router.refresh();
    } catch (verifyError) {
      setError(verifyError instanceof ApiError ? verifyError.message : 'کد وارد شده صحیح نیست.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void requestOtp();
        }}
        noValidate
      >
        <h1 className="text-xl font-bold text-brand">ورود / ثبت‌نام</h1>
        <p className="mt-2 text-[15px] text-muted">
          شماره موبایل خود را وارد کنید تا کد ورود ارسال شود.
        </p>

        <div className="mt-7">
          <Label htmlFor="phone" required>
            شماره موبایل
          </Label>
          <div className="relative">
            <Smartphone className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(digitsOnly(event.target.value).slice(0, 11))}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              className="num pr-12 text-center tracking-widest"
              invalid={Boolean(error)}
            />
          </div>
          <FieldError message={error} />
        </div>

        <Button type="submit" block size="lg" loading={loading} className="mt-6">
          دریافت کد تأیید
        </Button>

        <p className="mt-5 text-center text-xs leading-6 text-muted">
          با ورود، قوانین و شرایط استفاده از سقف من را می‌پذیرید.
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void verify();
      }}
      noValidate
    >
      <button
        type="button"
        onClick={() => {
          setStep('phone');
          setCode('');
          setError(undefined);
          setNotice(undefined);
        }}
        className="mb-5 flex items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <ArrowRight className="h-4 w-4" />
        تغییر شماره موبایل
      </button>

      <h1 className="text-xl font-bold text-brand">کد تأیید را وارد کنید</h1>
      <p className="num mt-2 text-[15px] text-muted">کد به شماره {formatMobile(phone)} ارسال شد.</p>

      <div className="mt-7">
        <Label htmlFor="code" required>
          کد تأیید
        </Label>
        <Input
          id="code"
          ref={codeRef}
          value={code}
          onChange={(event) => setCode(digitsOnly(event.target.value).slice(0, 6))}
          placeholder="- - - - -"
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          className="num h-14 text-center text-xl tracking-[0.6em]"
          invalid={Boolean(error)}
        />
        <FieldError message={error} />
        {notice && !error && <p className="mt-2 text-sm text-success">{notice}</p>}
      </div>

      <Button type="submit" block size="lg" loading={loading} className="mt-6">
        ورود به حساب
      </Button>

      <div className="mt-5 text-center text-sm">
        {secondsLeft > 0 ? (
          <p className="num text-muted">
            ارسال مجدد کد تا {toPersianDigits(secondsLeft)} ثانیه دیگر
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void requestOtp(true)}
            className="font-medium text-brand hover:text-gold"
          >
            ارسال دوباره کد
          </button>
        )}
      </div>
    </form>
  );
}
