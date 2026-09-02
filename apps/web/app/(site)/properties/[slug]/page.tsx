import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Maximize2,
  BedDouble,
  Bath,
  Building2,
  CalendarDays,
  Car,
  Layers,
  Eye,
  CheckCircle2,
  Sofa,
  Flame,
  Snowflake,
  PanelsTopLeft,
  Grid2X2,
  Paintbrush,
} from 'lucide-react';
import type { PropertyCardDto, PropertyDetailDto } from '@saghf/types';
import {
  CABINET_LABELS,
  COOLING_LABELS,
  FLOOR_MATERIAL_LABELS,
  HEATING_LABELS,
  WALL_MATERIAL_LABELS,
} from '@saghf/config';
import { apiFetch, SITE_URL } from '@/lib/api';
import { Gallery } from '@/components/property/gallery';
import { ContactCard } from '@/components/property/contact-card';
import { StickyContactBar } from '@/components/property/sticky-contact-bar';
import { FavoriteButton } from '@/components/property/favorite-button';
import { PropertyGrid } from '@/components/property/property-grid';
import { Badge } from '@/components/ui/badge';
import { formatJalali, formatNumber, formatToman, toPersianDigits } from '@/lib/format';
import { priceBlock } from '@/components/property/property-card';

export const revalidate = 120;

async function getProperty(slug: string): Promise<PropertyDetailDto | null> {
  try {
    return await apiFetch<PropertyDetailDto>(`/properties/${encodeURIComponent(slug)}`, {
      revalidate: 120,
    });
  } catch {
    return null;
  }
}

async function getSimilar(slug: string): Promise<PropertyCardDto[]> {
  try {
    return await apiFetch<PropertyCardDto[]>(`/properties/${encodeURIComponent(slug)}/similar`, {
      revalidate: 300,
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const property = await getProperty(params.slug);
  if (!property) return { title: 'آگهی یافت نشد' };

  const description = property.description.slice(0, 155);
  return {
    title: property.title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: property.title,
      description,
      type: 'article',
      url: `${SITE_URL}/properties/${property.slug}`,
      images: property.coverImage ? [{ url: property.coverImage }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await getProperty(params.slug);
  if (!property) notFound();

  const similar = await getSimilar(params.slug);
  const price = priceBlock(property);

  // Structured data — note it advertises the COMPANY phone, never the owner's.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}/properties/${property.slug}`,
    datePosted: property.publishedAt ?? property.createdAt,
    image: property.images.map((image) => `${SITE_URL}${image.url}`),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.neighborhood,
      addressCountry: 'IR',
    },
    floorSize: { '@type': 'QuantitativeValue', value: property.area, unitCode: 'MTK' },
    numberOfRooms: property.rooms,
    ...(property.price
      ? {
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'IRT',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    provider: {
      '@type': 'RealEstateAgent',
      name: property.contact.companyName,
      telephone: property.contact.primaryPhone,
    },
  };

  const specs = [
    {
      icon: <Maximize2 className="h-5 w-5" />,
      label: 'متراژ',
      value: `${formatNumber(property.area)} متر`,
    },
    {
      icon: <BedDouble className="h-5 w-5" />,
      label: 'اتاق خواب',
      value: formatNumber(property.rooms),
    },
    property.bathrooms
      ? {
          icon: <Bath className="h-5 w-5" />,
          label: 'سرویس',
          value: formatNumber(property.bathrooms),
        }
      : null,
    property.floor !== null
      ? {
          icon: <Layers className="h-5 w-5" />,
          label: 'طبقه',
          value: property.totalFloors
            ? `${formatNumber(property.floor)} از ${formatNumber(property.totalFloors)}`
            : formatNumber(property.floor),
        }
      : null,
    property.constructionYear
      ? {
          icon: <CalendarDays className="h-5 w-5" />,
          label: 'سال ساخت',
          value: toPersianDigits(property.constructionYear),
        }
      : null,
    {
      icon: <Car className="h-5 w-5" />,
      label: 'پارکینگ',
      value: property.parkingCount > 0 ? 'دارد' : 'ندارد',
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'نوع ملک',
      value: property.propertyType.title,
    },
    property.hallArea
      ? {
          icon: <Sofa className="h-5 w-5" />,
          label: 'مساحت سالن',
          value: `${formatNumber(property.hallArea)} متر`,
        }
      : null,
    property.landArea
      ? {
          icon: <Maximize2 className="h-5 w-5" />,
          label: 'متراژ زمین',
          value: `${formatNumber(property.landArea)} متر`,
        }
      : null,
    property.heating
      ? {
          icon: <Flame className="h-5 w-5" />,
          label: 'گرمایش',
          value: HEATING_LABELS[property.heating],
        }
      : null,
    property.cooling
      ? {
          icon: <Snowflake className="h-5 w-5" />,
          label: 'سرمایش',
          value: COOLING_LABELS[property.cooling],
        }
      : null,
    property.cabinet
      ? {
          icon: <PanelsTopLeft className="h-5 w-5" />,
          label: 'کابینت',
          value: CABINET_LABELS[property.cabinet],
        }
      : null,
    property.floorMaterial
      ? {
          icon: <Grid2X2 className="h-5 w-5" />,
          label: 'کف‌پوش',
          value: FLOOR_MATERIAL_LABELS[property.floorMaterial],
        }
      : null,
    property.wallMaterial
      ? {
          icon: <Paintbrush className="h-5 w-5" />,
          label: 'پوشش دیوار',
          value: WALL_MATERIAL_LABELS[property.wallMaterial],
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container py-6 pb-28 lg:py-9 lg:pb-12">
        <nav aria-label="مسیر صفحه" className="mb-5 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand">
                خانه
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/properties" className="hover:text-brand">
                آگهی‌ها
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/properties?neighborhood=${property.slug.split('-').slice(2, -1).join('-')}`}
                className="hover:text-brand"
              >
                {property.neighborhood}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-brand">{property.title}</li>
          </ol>
        </nav>

<div
  className="
    grid
    w-full
    min-w-0
    gap-6

    lg:grid-cols-[minmax(0,1fr)_340px]
    xl:grid-cols-[minmax(0,1fr)_360px]
  "
>          <div className="space-y-6">
            <Gallery images={property.images} title={property.title} />

            <section className="surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone="info">{property.transaction.title}</Badge>
                    {property.isFeatured && <Badge tone="gold">ویژه</Badge>}
                    {property.isNew && <Badge tone="navy">جدید</Badge>}
                  </div>
                  <h1 className="text-xl font-bold leading-relaxed text-brand lg:text-2xl">
                    {property.title}
                  </h1>
                  <p className="mt-1 text-[15px] text-muted">{property.displayAddress}</p>
                </div>
                <FavoriteButton propertyId={property.id} />
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded bg-cream-soft p-5">
                <div>
                  <p className="w-full text-sm text-muted">{price.label}</p>
                  <p className="w-full num text-2xl font-bold text-brand">{price.value}</p>
                  {property.pricePerMeter && (
                    <p className="num mt-1 text-right text-sm text-muted">
                      قیمت هر متر: {formatToman(property.pricePerMeter)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span className="num">{formatNumber(property.viewCount)}</span> بازدید
                  </span>
                  <span className="num" dir="rtl">
                    {formatJalali(property.publishedAt ?? property.createdAt, 'numeric')}
                  </span>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded border border-line p-4">
                    <dt className="flex items-center gap-2 text-sm text-muted">
                      <span className="text-gold">{spec.icon}</span>
                      {spec.label}
                    </dt>
                    <dd className="num mt-1 text-[15px] font-bold text-brand">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {property.amenities.length > 0 && (
              <section className="surface p-6" aria-labelledby="amenities-heading">
                <h2 id="amenities-heading" className="gold-underline text-lg font-bold text-brand">
                  امکانات
                </h2>
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li key={amenity.id} className="flex items-center gap-2 text-[15px] text-ink">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      {amenity.title}
                    </li>
                  ))}
                </ul>
              </section>
            )}

           <section
  className="
    w-full
    min-w-0
    rounded-[var(--radius-lg)]
    border
    border-[var(--line)]
    bg-white
    p-4
    shadow-[var(--shadow-sm)]

    sm:p-6
  "
  aria-labelledby="description-heading"
>
  <h2
    id="description-heading"
    className="
      accent-underline
      text-lg
      font-bold
      text-[var(--navy)]
    "
  >
    توضیحات
  </h2>

  <div
    className="
      mt-5
      w-full
      min-w-0
      whitespace-pre-wrap
      
      [overflow-wrap:anywhere]

      text-[14px]
      leading-8
      text-[var(--text-body)]

      sm:text-[15px]
      sm:leading-9
    "
  >
    {property.description}
  </div>
</section>

            {/* <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              displayAddress={property.displayAddress}
            /> */}
          </div>

          <div className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <ContactCard contact={property.contact} />
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-14" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="gold-underline mb-6 text-xl font-bold text-brand">
              آگهی‌های مشابه
            </h2>
            <PropertyGrid properties={similar} columns={4} />
          </section>
        )}
      </div>

      <StickyContactBar contact={property.contact} />
    </>
  );
}
