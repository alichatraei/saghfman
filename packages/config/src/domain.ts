import {
  TransactionKind,
  DeedType,
  PropertyStatus,
  HeatingType,
  CoolingType,
  CabinetType,
  FloorMaterial,
  WallMaterial,
} from '@saghf/types';

export const PROPERTY_TYPES = [
  { slug: 'apartment', title: 'آپارتمان', icon: 'building-2', landOnly: false },
  { slug: 'house', title: 'خانه', icon: 'home', landOnly: false },
  { slug: 'villa', title: 'ویلا', icon: 'castle', landOnly: false },
  { slug: 'land', title: 'زمین', icon: 'land-plot', landOnly: true },
  { slug: 'garden', title: 'باغ', icon: 'trees', landOnly: true },
  { slug: 'shop', title: 'مغازه', icon: 'store', landOnly: false },
  { slug: 'commercial', title: 'تجاری', icon: 'building', landOnly: false },
  { slug: 'office', title: 'اداری', icon: 'briefcase', landOnly: false },
  { slug: 'warehouse', title: 'انبار', icon: 'warehouse', landOnly: false },
] as const;

export const TRANSACTION_TYPES = [
  { slug: 'sale', title: 'فروش', kind: TransactionKind.SALE },
  { slug: 'rent', title: 'اجاره', kind: TransactionKind.RENT },
  { slug: 'full-mortgage', title: 'رهن کامل', kind: TransactionKind.FULL_MORTGAGE },
  { slug: 'mortgage-rent', title: 'رهن و اجاره', kind: TransactionKind.MORTGAGE_RENT },
  { slug: 'presale', title: 'پیش‌فروش', kind: TransactionKind.PRESALE },
  { slug: 'exchange', title: 'معاوضه', kind: TransactionKind.EXCHANGE },
] as const;

export const AMENITIES = [
  { slug: 'elevator', title: 'آسانسور', icon: 'move-vertical' },
  { slug: 'parking', title: 'پارکینگ', icon: 'car' },
  { slug: 'storage', title: 'انباری', icon: 'package' },
  { slug: 'balcony', title: 'بالکن', icon: 'building' },
  { slug: 'security-door', title: 'درب ضد سرقت', icon: 'shield' },
  { slug: 'pool', title: 'استخر', icon: 'waves' },
  { slug: 'gym', title: 'سالن ورزشی', icon: 'dumbbell' },
  { slug: 'guard', title: 'نگهبانی ۲۴ ساعته', icon: 'shield-check' },
  { slug: 'package-unit', title: 'کولر گازی', icon: 'air-vent' },
  { slug: 'central-heating', title: 'شوفاژ', icon: 'flame' },
  { slug: 'terrace', title: 'تراس', icon: 'sun' },
  { slug: 'renovated', title: 'نوساز و آماده سکونت', icon: 'sparkles' },
] as const;

export const DEED_TYPE_LABELS: Record<DeedType, string> = {
  [DeedType.SIX_DANG]: 'شش‌دانگ',
  [DeedType.ENDOWMENT]: 'وقفی',
  [DeedType.COOPERATIVE]: 'تعاونی',
  [DeedType.AGREEMENT]: 'قولنامه‌ای',
  [DeedType.OTHER]: 'سایر',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.DRAFT]: 'پیش‌نویس',
  [PropertyStatus.PENDING]: 'در انتظار بررسی',
  [PropertyStatus.PUBLISHED]: 'منتشر شده',
  [PropertyStatus.REJECTED]: 'رد شده',
  [PropertyStatus.EXPIRED]: 'پایان یافته',
  [PropertyStatus.INACTIVE]: 'غیرفعال',
};

export const HEATING_LABELS: Record<HeatingType, string> = {
  [HeatingType.PACKAGE]: 'پکیج',
  [HeatingType.HEATER]: 'بخاری',
  [HeatingType.CENTRAL]: 'شوفاژ مرکزی',
  [HeatingType.FLOOR_HEATING]: 'گرمایش از کف',
  [HeatingType.NONE]: 'ندارد',
};

export const COOLING_LABELS: Record<CoolingType, string> = {
  [CoolingType.SPLIT]: 'کولر گازی',
  [CoolingType.EVAPORATIVE]: 'کولر آبی',
  [CoolingType.CENTRAL]: 'چیلر مرکزی',
  [CoolingType.NONE]: 'ندارد',
};

export const CABINET_LABELS: Record<CabinetType, string> = {
  [CabinetType.MDF]: 'ام‌دی‌اف (MDF)',
  [CabinetType.METAL]: 'فلزی',
  [CabinetType.WOOD]: 'چوبی',
  [CabinetType.OTHER]: 'سایر',
};

export const FLOOR_MATERIAL_LABELS: Record<FloorMaterial, string> = {
  [FloorMaterial.CARPET]: 'موکت',
  [FloorMaterial.CERAMIC]: 'سرامیک',
  [FloorMaterial.PARQUET]: 'پارکت',
  [FloorMaterial.STONE]: 'سنگ',
  [FloorMaterial.OTHER]: 'سایر',
};

export const WALL_MATERIAL_LABELS: Record<WallMaterial, string> = {
  [WallMaterial.WALLPAPER]: 'کاغذ دیواری',
  [WallMaterial.PAINT]: 'رنگ',
  [WallMaterial.OTHER]: 'سایر',
};

/** Property types that own a plot, so «متراژ زمین» is meaningful for them. */
export const LAND_AREA_TYPES = ['villa', 'house', 'land', 'garden'];

/** Transactions that use deposit + monthly rent instead of a total price. */
export const RENTAL_KINDS: TransactionKind[] = [
  TransactionKind.RENT,
  TransactionKind.FULL_MORTGAGE,
  TransactionKind.MORTGAGE_RENT,
];

export const PROPERTY_LIMITS = {
  minArea: 10,
  maxArea: 100000,
  minYear: 1330,
  maxRooms: 10,
  titleMin: 10,
  titleMax: 40,
  descriptionMin: 0,
  descriptionMax: 700,
  maxImages: 15,
  defaultPageSize: 12,
  maxPageSize: 48,
  publishDurationDays: 30,
} as const;
