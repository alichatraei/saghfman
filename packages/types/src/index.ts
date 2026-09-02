/**
 * Shared contract types between the NestJS API and the Next.js web app.
 * Hand-written mirrors of the API DTOs so the web app never imports Prisma
 * model types (which would risk leaking private owner fields into the client).
 */

/* ----------------------------- Enums ----------------------------- */

export enum UserRole {
  USER = 'USER',
  EDITOR = 'EDITOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export enum TransactionKind {
  SALE = 'SALE',
  RENT = 'RENT',
  FULL_MORTGAGE = 'FULL_MORTGAGE',
  MORTGAGE_RENT = 'MORTGAGE_RENT',
  PRESALE = 'PRESALE',
  EXCHANGE = 'EXCHANGE',
}

export enum DeedType {
  SIX_DANG = 'SIX_DANG',
  ENDOWMENT = 'ENDOWMENT',
  COOPERATIVE = 'COOPERATIVE',
  AGREEMENT = 'AGREEMENT',
  OTHER = 'OTHER',
}

export enum HeatingType {
  PACKAGE = 'PACKAGE',
  HEATER = 'HEATER',
  CENTRAL = 'CENTRAL',
  FLOOR_HEATING = 'FLOOR_HEATING',
  NONE = 'NONE',
}

export enum CoolingType {
  SPLIT = 'SPLIT',
  EVAPORATIVE = 'EVAPORATIVE',
  CENTRAL = 'CENTRAL',
  NONE = 'NONE',
}

export enum CabinetType {
  MDF = 'MDF',
  METAL = 'METAL',
  WOOD = 'WOOD',
  OTHER = 'OTHER',
}

export enum FloorMaterial {
  CARPET = 'CARPET',
  CERAMIC = 'CERAMIC',
  PARQUET = 'PARQUET',
  STONE = 'STONE',
  OTHER = 'OTHER',
}

export enum WallMaterial {
  WALLPAPER = 'WALLPAPER',
  PAINT = 'PAINT',
  OTHER = 'OTHER',
}

export enum NotificationType {
  PROPERTY_APPROVED = 'PROPERTY_APPROVED',
  PROPERTY_REJECTED = 'PROPERTY_REJECTED',
  PROPERTY_EXPIRED = 'PROPERTY_EXPIRED',
  NEW_MATCH = 'NEW_MATCH',
  SYSTEM = 'SYSTEM',
}

export type PropertySort = 'newest' | 'price_desc' | 'price_asc' | 'area_desc';

/* --------------------------- Taxonomy ---------------------------- */

export interface PropertyTypeDto {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  landOnly: boolean;
  order: number;
}

export interface TransactionTypeDto {
  id: string;
  slug: string;
  title: string;
  kind: TransactionKind;
  order: number;
}

export interface NeighborhoodDto {
  id: string;
  slug: string;
  title: string;
  city: string;
  province: string;
}

export interface CityDto {
  city: string;
  province: string;
  neighborhoodCount: number;
}

export interface AmenityDto {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
}

/* -------------------------- Properties --------------------------- */

export interface PropertyImageDto {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  isCover: boolean;
  order: number;
  alt: string | null;
}

/** Public card shape — never contains any owner-identifying field. */
export interface PropertyCardDto {
  id: string;
  slug: string;
  title: string;
  city: string;
  neighborhood: string;
  area: number;
  hallArea: number | null;
  landArea: number | null;
  rooms: number;
  floor: number | null;
  totalFloors: number | null;
  transaction: { slug: string; title: string; kind: TransactionKind };
  propertyType: { slug: string; title: string };
  price: string | null;
  pricePerMeter: string | null;
  deposit: string | null;
  monthlyRent: string | null;
  isFeatured: boolean;
  isNew: boolean;
  coverImage: string | null;
  publishedAt: string | null;
}

/** Public detail shape — never contains any owner-identifying field. */
export interface PropertyDetailDto extends PropertyCardDto {
  description: string;
  constructionYear: number | null;
  bathrooms: number | null;
  parkingCount: number;
  hasElevator: boolean;
  hasStorage: boolean;
  hasBalcony: boolean;
  isNegotiable: boolean;
  exchangeable: boolean;
  deedType: DeedType | null;
  heating: HeatingType | null;
  cooling: CoolingType | null;
  cabinet: CabinetType | null;
  floorMaterial: FloorMaterial | null;
  wallMaterial: WallMaterial | null;
  /** Approximate, privacy-safe display address. Exact address is admin-only. */
  displayAddress: string;
  showExactLocation: boolean;
  latitude: number | null;
  longitude: number | null;
  amenities: AmenityDto[];
  images: PropertyImageDto[];
  viewCount: number;
  createdAt: string;
  /** Company contact — replaces the owner phone on every public page. */
  contact: CompanyContactDto;
}

export interface CompanyContactDto {
  companyName: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  whatsapp: string | null;
  /** شماره پیام‌رسان — روی صفحه آگهی به‌جای دکمه واتساپ نمایش داده می‌شود. */
  messengerPhone: string | null;
  workingHours: string | null;
  tagline: string | null;
  /** Messaging channels shown next to the phone number. */
  socials: CompanySocialsDto;
}

/** Every value is either a full URL or the handle/phone the channel expects. */
export interface CompanySocialsDto {
  telegram: string | null;
  whatsappLink: string | null;
  rubika: string | null;
  bale: string | null;
  eitaa: string | null;
  instagram: string | null;
}

/** Owner-facing shape for /me/properties. */
export interface MyPropertyDto extends PropertyCardDto {
  status: PropertyStatus;
  rejectionReason: string | null;
  viewCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Full owner-facing shape used to prefill the edit form. */
export interface MyPropertyDetailDto extends MyPropertyDto {
  description: string;
  /** The owner's own street address — returned only to the owner and admins. */
  address: string;
  displayAddress: string;
  showExactLocation: boolean;
  latitude: number | null;
  longitude: number | null;
  bathrooms: number | null;
  constructionYear: number | null;
  parkingCount: number;
  isNegotiable: boolean;
  exchangeable: boolean;
  deedType: DeedType | null;
  heating: HeatingType | null;
  cooling: CoolingType | null;
  cabinet: CabinetType | null;
  floorMaterial: FloorMaterial | null;
  wallMaterial: WallMaterial | null;
  propertyTypeSlug: string;
  transactionSlug: string;
  neighborhoodSlug: string;
  amenitySlugs: string[];
  images: PropertyImageDto[];
}

/**
 * Admin-only shape. The ONLY DTO allowed to carry ownerPhone.
 * Extends the full detail shape so the admin edit form can be prefilled.
 */
export interface AdminPropertyDto extends MyPropertyDetailDto {
  ownerId: string;
  ownerName: string | null;
  ownerPhone: string;
}

/* ---------------------------- Queries ---------------------------- */

export interface PropertyQuery {
  q?: string;
  neighborhood?: string;
  city?: string;
  propertyType?: string;
  transaction?: string;
  kind?: TransactionKind;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  rooms?: number;
  minYear?: number;
  maxYear?: number;
  parking?: boolean;
  elevator?: boolean;
  storage?: boolean;
  balcony?: boolean;
  amenities?: string[];
  sort?: PropertySort;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ----------------------------- Auth ------------------------------ */

export interface RequestOtpResponse {
  expiresInSeconds: number;
  resendAfterSeconds: number;
  /** Only populated when SMS_PROVIDER=mock (development). */
  devCode?: string;
}

export interface AuthUserDto {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  city: string | null;
  preferredTransaction: string | null;
  notifyBySms: boolean;
  notifyByEmail: boolean;
  notifyOnMatch: boolean;
  hidePhoneFromListings: boolean;
  createdAt: string;
}

export interface AuthTokensDto {
  accessToken: string;
  expiresIn: number;
  user: AuthUserDto;
}

/* ----------------------------- Admin ----------------------------- */

export interface AdminUserDto {
  id: string;
  phone: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  propertyCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminDashboardDto {
  users: number;
  publishedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  propertiesToday: number;
  favorites: number;
  viewsLast7Days: { date: string; count: number }[];
  recentPending: AdminPropertyDto[];
}

export type BannerVariant = 'info' | 'success' | 'warning' | 'promo';

/** Public shape — only banners that are active and inside their date window. */
export interface BannerDto {
  id: string;
  title: string;
  message: string | null;
  variant: BannerVariant;
  ctaLabel: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
  dismissible: boolean;
}

/** Admin shape — adds scheduling and status fields. */
export interface AdminBannerDto extends BannerDto {
  position: string;
  isActive: boolean;
  order: number;
  startsAt: string | null;
  endsAt: string | null;
  /** محاسبه‌شده در سرور: آیا همین حالا روی سایت دیده می‌شود؟ */
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error?: string;
}
