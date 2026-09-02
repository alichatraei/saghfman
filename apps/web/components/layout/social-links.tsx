import { MessageCircle, Send, Instagram } from 'lucide-react';
import type { CompanySocialsDto } from '@saghf/types';
import { cn } from '@/lib/cn';

/**
 * Company messaging channels. Every value is admin-editable and may be either
 * a full URL or a bare handle, so the href is normalised here.
 */
const CHANNELS: {
  key: keyof CompanySocialsDto;
  label: string;
  base: string;
  icon: React.ReactNode;
}[] = [
  { key: 'telegram', label: 'تلگرام', base: 'https://t.me/', icon: <Send className="h-4 w-4" /> },
  {
    key: 'whatsappLink',
    label: 'واتساپ',
    base: 'https://wa.me/',
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    key: 'rubika',
    label: 'روبیکا',
    base: 'https://rubika.ir/',
    icon: <MessageCircle className="h-4 w-4" />,
  },
  { key: 'bale', label: 'بله', base: 'https://ble.ir/', icon: <MessageCircle className="h-4 w-4" /> },
  {
    key: 'eitaa',
    label: 'ایتا',
    base: 'https://eitaa.com/',
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    key: 'instagram',
    label: 'اینستاگرام',
    base: 'https://instagram.com/',
    icon: <Instagram className="h-4 w-4" />,
  },
];

function toHref(base: string, value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${base}${trimmed.replace(/^@/, '')}`;
}

export function SocialLinks({
  socials,
  tone = 'dark',
  className,
}: {
  socials: CompanySocialsDto | undefined;
  /** «dark» for the navy footer, «light» for white cards. */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  if (!socials) return null;

  const items = CHANNELS.filter((channel) => Boolean(socials[channel.key]));
  if (items.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((channel) => (
        <li key={channel.key}>
          <a
            href={toHref(channel.base, socials[channel.key] as string)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-2 text-sm transition-colors',
              tone === 'dark'
                ? 'border-white/15 text-white/85 hover:border-white/35 hover:text-white'
                : 'border-[var(--line)] text-[var(--navy)] hover:border-[var(--green-300)] hover:bg-[var(--green-50)]',
            )}
          >
            {channel.icon}
            {channel.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
