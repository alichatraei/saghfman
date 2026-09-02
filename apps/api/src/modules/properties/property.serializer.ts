import { Prisma } from '@prisma/client';
import {
  AdminPropertyDto,
  MyPropertyDetailDto,
  CompanyContactDto,
  MyPropertyDto,
  PropertyCardDto,
  HeatingType,
  CoolingType,
  CabinetType,
  FloorMaterial,
  WallMaterial,
  PropertyDetailDto,
  PropertyStatus,
  TransactionKind,
  DeedType,
} from '@saghf/types';

/**
 * ============================================================================
 *  OWNER PRIVACY — READ THIS BEFORE CHANGING ANYTHING IN THIS FILE
 * ============================================================================
 *  Public endpoints must never leak the owner's mobile number, email, exact
 *  address or any other private user data. Two mechanisms enforce that:
 *
 *  1. SELECTION: `publicPropertySelect` does not select the `owner` relation
 *     at all, so the private data never even leaves PostgreSQL.
 *  2. MAPPING: the mappers below build DTOs field-by-field. No spread of a
 *     Prisma entity is allowed, so a future schema column cannot silently
 *     appear in a public response.
 *
 *  `adminPropertySelect` is the only selection that includes owner.phone and
 *  it is reachable exclusively from role-guarded /admin routes.
 *  A regression test lives in ./tests/public-property-privacy.spec.ts.
 * ============================================================================
 */

export const publicPropertySelect = {
  id: true,
  slug: true,
  code: true,
  title: true,
  description: true,
  area: true,
  hallArea: true,
  landArea: true,
  rooms: true,
  bathrooms: true,
  floor: true,
  totalFloors: true,
  constructionYear: true,
  parkingCount: true,
  hasElevator: true,
  hasStorage: true,
  hasBalcony: true,
  deedType: true,
  heating: true,
  cooling: true,
  cabinet: true,
  floorMaterial: true,
  wallMaterial: true,
  price: true,
  pricePerMeter: true,
  deposit: true,
  monthlyRent: true,
  isNegotiable: true,
  exchangeable: true,
  isFeatured: true,
  viewCount: true,
  displayAddress: true,
  showExactLocation: true,
  latitude: true,
  longitude: true,
  publishedAt: true,
  createdAt: true,
  propertyType: { select: { slug: true, title: true } },
  transactionType: { select: { slug: true, title: true, kind: true } },
  neighborhood: { select: { slug: true, title: true, city: true } },
  images: {
    select: { id: true, url: true, width: true, height: true, isCover: true, order: true, alt: true },
    orderBy: [{ isCover: 'desc' }, { order: 'asc' }] as const,
  },
  amenities: { select: { amenity: { select: { id: true, slug: true, title: true, icon: true } } } },
} satisfies Prisma.PropertySelect;

/** Owner-facing selection: adds moderation fields, still no other user data. */
export const myPropertySelect = {
  ...publicPropertySelect,
  status: true,
  rejectionReason: true,
  expiresAt: true,
  updatedAt: true,
} satisfies Prisma.PropertySelect;

/** Owner-facing detail: adds the owner's own address for the edit form. */
export const myPropertyDetailSelect = {
  ...myPropertySelect,
  address: true,
} satisfies Prisma.PropertySelect;

/** ADMIN ONLY. The single selection allowed to read the owner's phone. */
export const adminPropertySelect = {
  ...myPropertyDetailSelect,
  ownerId: true,
  owner: { select: { id: true, fullName: true, phone: true } },
} satisfies Prisma.PropertySelect;

export type PublicPropertyRow = Prisma.PropertyGetPayload<{ select: typeof publicPropertySelect }>;
export type MyPropertyRow = Prisma.PropertyGetPayload<{ select: typeof myPropertySelect }>;
export type MyPropertyDetailRow = Prisma.PropertyGetPayload<{ select: typeof myPropertyDetailSelect }>;
export type AdminPropertyRow = Prisma.PropertyGetPayload<{ select: typeof adminPropertySelect }>;

const money = (value: bigint | null): string | null => (value === null ? null : value.toString());

const NEW_LISTING_WINDOW_MS = 7 * 24 * 3600 * 1000;

function isRecent(publishedAt: Date | null, createdAt: Date): boolean {
  const reference = publishedAt ?? createdAt;
  return Date.now() - reference.getTime() < NEW_LISTING_WINDOW_MS;
}

export function toPropertyCard(row: PublicPropertyRow): PropertyCardDto {
  const cover = row.images.find((image) => image.isCover) ?? row.images[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    city: row.neighborhood.city,
    neighborhood: row.neighborhood.title,
    area: row.area,
    hallArea: row.hallArea,
    landArea: row.landArea,
    rooms: row.rooms,
    floor: row.floor,
    totalFloors: row.totalFloors,
    transaction: {
      slug: row.transactionType.slug,
      title: row.transactionType.title,
      kind: row.transactionType.kind as TransactionKind,
    },
    propertyType: { slug: row.propertyType.slug, title: row.propertyType.title },
    price: money(row.price),
    pricePerMeter: money(row.pricePerMeter),
    deposit: money(row.deposit),
    monthlyRent: money(row.monthlyRent),
    isFeatured: row.isFeatured,
    isNew: isRecent(row.publishedAt, row.createdAt),
    coverImage: cover?.url ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export function toPropertyDetail(
  row: PublicPropertyRow,
  contact: CompanyContactDto,
): PropertyDetailDto {
  return {
    ...toPropertyCard(row),
    description: row.description,
    constructionYear: row.constructionYear,
    bathrooms: row.bathrooms,
    parkingCount: row.parkingCount,
    hasElevator: row.hasElevator,
    hasStorage: row.hasStorage,
    hasBalcony: row.hasBalcony,
    isNegotiable: row.isNegotiable,
    exchangeable: row.exchangeable,
    deedType: (row.deedType as DeedType | null) ?? null,
    heating: (row.heating as HeatingType | null) ?? null,
    cooling: (row.cooling as CoolingType | null) ?? null,
    cabinet: (row.cabinet as CabinetType | null) ?? null,
    floorMaterial: (row.floorMaterial as FloorMaterial | null) ?? null,
    wallMaterial: (row.wallMaterial as WallMaterial | null) ?? null,
    // Falls back to a neighbourhood-level line so the exact street address of
    // a private home is never published unless the owner opted in.
    displayAddress:
      row.displayAddress ?? `${row.neighborhood.city}، ${row.neighborhood.title}`,
    showExactLocation: row.showExactLocation,
    latitude: row.showExactLocation ? row.latitude : null,
    longitude: row.showExactLocation ? row.longitude : null,
    amenities: row.amenities.map((link) => link.amenity),
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      width: image.width,
      height: image.height,
      isCover: image.isCover,
      order: image.order,
      alt: image.alt,
    })),
    viewCount: row.viewCount,
    createdAt: row.createdAt.toISOString(),
    contact,
  };
}

export function toMyProperty(row: MyPropertyRow): MyPropertyDto {
  return {
    ...toPropertyCard(row),
    status: row.status as PropertyStatus,
    rejectionReason: row.rejectionReason,
    viewCount: row.viewCount,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMyPropertyDetail(row: MyPropertyDetailRow): MyPropertyDetailDto {
  return {
    ...toMyProperty(row),
    description: row.description,
    address: row.address,
    displayAddress: row.displayAddress ?? `${row.neighborhood.city}، ${row.neighborhood.title}`,
    showExactLocation: row.showExactLocation,
    latitude: row.latitude,
    longitude: row.longitude,
    bathrooms: row.bathrooms,
    constructionYear: row.constructionYear,
    parkingCount: row.parkingCount,
    isNegotiable: row.isNegotiable,
    exchangeable: row.exchangeable,
    deedType: (row.deedType as DeedType | null) ?? null,
    heating: (row.heating as HeatingType | null) ?? null,
    cooling: (row.cooling as CoolingType | null) ?? null,
    cabinet: (row.cabinet as CabinetType | null) ?? null,
    floorMaterial: (row.floorMaterial as FloorMaterial | null) ?? null,
    wallMaterial: (row.wallMaterial as WallMaterial | null) ?? null,
    propertyTypeSlug: row.propertyType.slug,
    transactionSlug: row.transactionType.slug,
    neighborhoodSlug: row.neighborhood.slug,
    amenitySlugs: row.amenities.map((link) => link.amenity.slug),
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      width: image.width,
      height: image.height,
      isCover: image.isCover,
      order: image.order,
      alt: image.alt,
    })),
  };
}

export function toAdminProperty(row: AdminPropertyRow): AdminPropertyDto {
  return {
    // The admin form needs every editable field, so it reuses the full
    // owner-facing mapper and only adds the owner contact block on top.
    ...toMyPropertyDetail(row),
    ownerId: row.ownerId,
    ownerName: row.owner.fullName,
    ownerPhone: row.owner.phone,
  };
}
