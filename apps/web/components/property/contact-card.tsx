import { Phone, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import type { CompanyContactDto } from '@saghf/types';
import { telHref, toPersianDigits } from '@/lib/format';
import { SocialLinks } from '@/components/layout/social-links';

/**
 * The only contact block that ever appears on a public property page.
 * Every number here comes from the company settings row in the database —
 * the property owner's mobile is never fetched, rendered or linked.
 */
export function ContactCard({ contact }: { contact: CompanyContactDto }) {
  // شماره‌ای که روی پیام‌رسان‌ها پاسخ داده می‌شود؛ اگر ثبت نشده باشد، شماره واتساپ.
  const messengerPhone = contact.messengerPhone ?? contact.whatsapp;

  return (
    <section className="surface p-6" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="gold-underline text-lg font-bold text-brand">
        تماس با شرکت
      </h2>

      <p className="mt-5 text-sm text-muted">شماره تماس</p>
      <p className="num mt-1 text-2xl font-bold tracking-wide text-brand">
        {toPersianDigits(contact.primaryPhone)}
      </p>
      {contact.secondaryPhone && (
        <p className="num mt-1 text-[15px] text-muted">{toPersianDigits(contact.secondaryPhone)}</p>
      )}

      {contact.workingHours && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Clock className="h-4 w-4 text-gold" />
          {contact.workingHours}
        </p>
      )}

      <div className="mt-5 space-y-3">
        <a
          href={telHref(contact.primaryPhone)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded bg-brand font-medium text-white transition-colors hover:bg-brand-alt"
        >
          <Phone className="h-5 w-5" />
          تماس تلفنی
        </a>

        {messengerPhone && (
          <a
            href={telHref(messengerPhone)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded border border-line bg-white font-medium text-brand transition-colors hover:border-gold"
          >
            <MessageSquare className="h-5 w-5 text-success" />
            <span>تلفن پیام‌رسان</span>
            <span className="num text-sm text-muted">{toPersianDigits(messengerPhone)}</span>
          </a>
        )}
      </div>

      {contact.socials && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-muted">پیام‌رسان‌های شرکت</p>
          <SocialLinks socials={contact.socials} tone="light" />
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 rounded bg-cream-soft p-4 text-sm leading-7 text-muted">
        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold" />
        اطلاعات تماس نمایش داده شده متعلق به شرکت است، نه مالک. همه هماهنگی‌ها از طریق کارشناسان{' '}
        {contact.companyName} انجام می‌شود.
      </p>
    </section>
  );
}
