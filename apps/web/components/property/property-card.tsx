import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Maximize2, BedDouble } from 'lucide-react';

import type { PropertyCardDto } from '@saghf/types';

import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from './favorite-button';

import { formatNumber, formatToman } from '@/lib/format';

const RENTAL_KINDS = ['RENT', 'FULL_MORTGAGE', 'MORTGAGE_RENT'];

export function priceBlock(property: PropertyCardDto): {
  value: string;
  label: string;
} {
  if (RENTAL_KINDS.includes(property.transaction.kind)) {
    if (property.deposit && property.monthlyRent) {
      return {
        value: formatToman(property.deposit),
        label: `رهن و اجاره ماهانه ${formatToman(property.monthlyRent)}`,
      };
    }

    if (property.deposit) {
      return {
        value: formatToman(property.deposit),
        label: 'رهن کامل',
      };
    }

    if (property.monthlyRent) {
      return {
        value: formatToman(property.monthlyRent),
        label: 'اجاره ماهانه',
      };
    }

    return {
      value: 'توافقی',
      label: 'اجاره',
    };
  }

  return {
    value: formatToman(property.price),
    label: 'قیمت کل',
  };
}

export function PropertyCard({ property }: { property: PropertyCardDto }) {
  const price = priceBlock(property);

  const isRental = RENTAL_KINDS.includes(property.transaction.kind);

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[var(--radius-lg)]
        border border-[var(--line)]
        bg-white
        shadow-[var(--shadow-sm)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[var(--green-200)]
        hover:shadow-[var(--shadow-card-hover)]
      "
    >
      {/* ---------------- Image ---------------- */}

      <div className="relative">
        <Link href={`/properties/${property.slug}`} className="block">
          <div
            className="
              relative
              aspect-[16/10]
              overflow-hidden
              bg-[var(--background-soft)]
            "
          >
            {property.coverImage ? (
              <Image
                src={property.coverImage}
                alt={property.title}
                fill
                sizes="
                  (max-width: 640px) 100vw,
                  (max-width: 1024px) 50vw,
                  33vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-500
                  ease-out
                  group-hover:scale-[1.045]
                "
              />
            ) : (
              <div
                className="
                  flex h-full
                  items-center
                  justify-center
                  bg-[var(--surface-green)]
                  text-sm
                  text-[var(--text-muted)]
                "
              >
                بدون تصویر
              </div>
            )}

            {/* subtle image overlay */}
            <div
              aria-hidden
              className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-t
                from-[rgba(8,47,66,0.08)]
                via-transparent
                to-transparent
              "
            />
          </div>
        </Link>

        {/* Badges */}

        <div className="absolute right-3 top-3 flex gap-2">
          {property.isFeatured && <Badge tone="accent">ویژه</Badge>}

          {!property.isFeatured && property.isNew && <Badge tone="navy">جدید</Badge>}
        </div>

        <FavoriteButton
          propertyId={property.id}
          className="
            absolute left-3 top-3
            border border-white/70
            bg-white/95
            shadow-sm
            backdrop-blur-md
          "
        />
      </div>

      {/* ---------------- Content ---------------- */}

      <div className="p-5">
        {/* Title */}

        <h3
          className="
            mb-1
            line-clamp-1
            text-[17px]
            font-bold
            text-[var(--navy)]
          "
        >
          <Link
            href={`/properties/${property.slug}`}
            className="
              transition-colors
              duration-200
              hover:text-[var(--green-700)]
            "
          >
            {property.title}
          </Link>
        </h3>

        {/* Location */}

        <p
          className="
            flex items-center
            gap-1.5
            text-sm
            text-[var(--text-secondary)]
          "
        >
          <MapPin
            className="
              h-4 w-4
              shrink-0
              text-[var(--green-600)]
            "
            strokeWidth={1.8}
          />

          <span className="line-clamp-1">
            {property.city}، {property.neighborhood}
          </span>
        </p>

        {/* Details */}

        <div
          className="
            mt-4
            flex items-center
            gap-5
            border-y
            border-[var(--line-soft)]
            py-3
            text-sm
            text-[var(--text-secondary)]
          "
        >
          <span className="flex items-center gap-1.5">
            <Maximize2
              className="
                h-4 w-4
                text-[var(--navy-700)]
              "
              strokeWidth={1.7}
            />

            <span>
              <span className="num font-medium text-[var(--navy)]">
                {formatNumber(property.area)}
              </span>{' '}
              متر
            </span>
          </span>

          {property.rooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble
                className="
                  h-4 w-4
                  text-[var(--navy-700)]
                "
                strokeWidth={1.7}
              />

              <span>
                <span className="num font-medium text-[var(--navy)]">
                  {formatNumber(property.rooms)}
                </span>{' '}
                خواب
              </span>
            </span>
          )}
        </div>

        {/* Price */}

        <div
          className="
            mt-4
            flex items-end
            justify-between
            gap-3
          "
        >
          <div>
            <p
              className="
                num
                text-[17px]
                font-bold
                text-[var(--navy)]
              "
            >
              {price.value}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-[var(--text-muted)]
              "
            >
              {price.label}
            </p>
          </div>

          <Badge tone={isRental ? 'info' : 'muted'}>{property.transaction.title}</Badge>
        </div>
      </div>
    </article>
  );
}
