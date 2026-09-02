import Link from 'next/link';
import { Phone, Clock, MapPin } from 'lucide-react';
import { SocialLinks } from './social-links';
import { apiFetch } from '@/lib/api';
import { formatMobile, telHref, toPersianDigits } from '@/lib/format';
import type { CompanyContactDto } from '@saghf/types';

async function getContact(): Promise<CompanyContactDto | null> {
  try {
    return await apiFetch<CompanyContactDto>('/settings/contact', { revalidate: 600 });
  } catch {
    return null;
  }
}

export async function SiteFooter() {
  const contact = await getContact();

  return (
    <footer className="mt-20 bg-brand text-white/85">
      <div className="container grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">سقف من</h2>
          <p className="max-w-sm text-[15px] leading-8">
            سامانه تخصصی خرید، فروش و اجاره ملک. همه آگهی‌ها پیش از انتشار توسط کارشناسان ما بررسی
            می‌شوند.
          </p>
        </div>

        <nav aria-label="پیوندهای سریع">
          <h3 className="mb-3 font-bold text-white">دسترسی سریع</h3>
          <ul className="space-y-2 text-[15px]">
            <li>
              <Link href="/properties?transaction=sale" className="hover:text-gold">
                خرید ملک
              </Link>
            </li>
            <li>
              <Link href="/properties?transaction=rent" className="hover:text-gold">
                اجاره ملک
              </Link>
            </li>
            <li>
              <Link href="/submit-property" className="hover:text-gold">
                ثبت آگهی
              </Link>
            </li>
            <li>
              <Link href="/account/listings" className="hover:text-gold">
                آگهی‌های من
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-3 font-bold text-white">تماس با شرکت</h3>
          {contact ? (
            <ul className="space-y-3 text-[15px]">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href={telHref(contact.primaryPhone)} className="num hover:text-gold">
                  {toPersianDigits(contact.primaryPhone)}
                </a>
              </li>
              {contact.secondaryPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" />
                  <a href={telHref(contact.secondaryPhone)} className="num hover:text-gold">
                    {toPersianDigits(contact.secondaryPhone)}
                  </a>
                </li>
              )}
              {contact.workingHours && (
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" />
                  {contact.workingHours}
                </li>
              )}
              {contact.whatsapp && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="num">واتساپ: {formatMobile(contact.whatsapp)}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-[15px]">اطلاعات تماس در دسترس نیست.</p>
          )}

          {contact?.socials && <SocialLinks socials={contact.socials} className="mt-4" />}
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-white/60 sm:flex-row sm:justify-between sm:text-start">
          <p>
            © {toPersianDigits(new Date().getFullYear())} سقف من — تمامی حقوق مادی و معنوی این وب‌سایت
            محفوظ است.
          </p>
          <p>
            طراحی و توسعه:{' '}
            <span className="font-medium text-white/85">علی چترایی</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
