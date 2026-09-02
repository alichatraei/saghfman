'use client';

import { Phone, MessageSquare } from 'lucide-react';
import type { CompanyContactDto } from '@saghf/types';
import { telHref, toPersianDigits } from '@/lib/format';

/** Mobile-only sticky call-to-action; company number only. */
export function StickyContactBar({ contact }: { contact: CompanyContactDto }) {
  const messengerPhone = contact.messengerPhone ?? contact.whatsapp;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <a
          href={telHref(contact.primaryPhone)}
          className="num flex h-12 flex-1 items-center justify-center gap-2 rounded bg-brand font-medium text-white"
        >
          <Phone className="h-5 w-5" />
          {toPersianDigits(contact.primaryPhone)}
        </a>
        {messengerPhone && (
          <a
            href={telHref(messengerPhone)}
            aria-label="تلفن پیام‌رسان"
            className="flex h-12 w-12 items-center justify-center rounded border border-line text-success"
          >
            <MessageSquare className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
}
