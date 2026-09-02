/* eslint-disable no-console */
import { NEIGHBORHOODS } from '@saghf/config';
import { PrismaClient, PropertyStatus, TransactionKind, UserRole, DeedType } from '@prisma/client';

const prisma = new PrismaClient();

const PROPERTY_TYPES = [
  { slug: 'apartment', title: 'آپارتمان', icon: 'building-2', landOnly: false },
  { slug: 'house', title: 'خانه', icon: 'home', landOnly: false },
  { slug: 'villa', title: 'ویلا', icon: 'castle', landOnly: false },
  { slug: 'land', title: 'زمین', icon: 'land-plot', landOnly: true },
  { slug: 'garden', title: 'باغ', icon: 'trees', landOnly: true },
  { slug: 'shop', title: 'مغازه', icon: 'store', landOnly: false },
  { slug: 'commercial', title: 'تجاری', icon: 'building', landOnly: false },
  { slug: 'office', title: 'اداری', icon: 'briefcase', landOnly: false },
  { slug: 'warehouse', title: 'انبار', icon: 'warehouse', landOnly: false },
];

const TRANSACTION_TYPES = [
  { slug: 'sale', title: 'فروش', kind: TransactionKind.SALE },
  { slug: 'rent', title: 'اجاره', kind: TransactionKind.RENT },
  { slug: 'full-mortgage', title: 'رهن کامل', kind: TransactionKind.FULL_MORTGAGE },
  { slug: 'mortgage-rent', title: 'رهن و اجاره', kind: TransactionKind.MORTGAGE_RENT },
  { slug: 'presale', title: 'پیش‌فروش', kind: TransactionKind.PRESALE },
  { slug: 'exchange', title: 'معاوضه', kind: TransactionKind.EXCHANGE },
];

const AMENITIES = [
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
];


interface SeedProperty {
  title: string;
  description: string;
  type: string;
  transaction: string;
  neighborhood: string;
  address: string;
  area: number;
  landArea?: number;
  rooms: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  year?: number;
  parking?: number;
  price?: bigint;
  deposit?: bigint;
  rent?: bigint;
  featured?: boolean;
  status?: PropertyStatus;
  rejectionReason?: string;
  amenities: string[];
  images: string[];
}

const SEED_PROPERTIES: SeedProperty[] = [
  {
    title: 'آپارتمان ۱۲۵ متری مرداویج',
    description:
      'آپارتمان بسیار شیک و نورگیر در یکی از بهترین کوچه‌های مرداویج. سازه‌ای با کیفیت بالا و طراحی مدرن، دارای پذیرایی بزرگ با پنجره‌های سرتاسری و دید باز به فضای سبز. آشپزخانه اپن با کابینت MDF و تجهیزات توکار، اتاق‌های خواب دلباز با کمدهای جادار. ساختمان دارای لابی مجلل، نگهبانی ۲۴ ساعته و پارکینگ اختصاصی می‌باشد.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'mardavij',
    address: 'اصفهان، مرداویج، فاز ۱، خیابان درختی، نبش گلستان یکم، پلاک ۲۴',
    area: 125,
    rooms: 2,
    bathrooms: 2,
    floor: 6,
    totalFloors: 10,
    year: 1396,
    parking: 1,
    price: 26_000_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'storage', 'balcony', 'guard', 'security-door', 'terrace'],
    images: ['apartment-1', 'apartment-2', 'apartment-3', 'kitchen-1'],
  },
  {
    title: 'ویلا ۳۵۰ متری گلدیس شاهین‌شهر',
    description:
      'ویلا لوکس با طراحی مدرن، استخر سرپوشیده، سونا و جکوزی، محوطه‌سازی زیبا و چشم‌انداز عالی به طبیعت. مصالح درجه یک، سیستم گرمایش از کف و پارکینگ سه ماشین.',
    type: 'villa',
    transaction: 'sale',
    neighborhood: 'goldis',
    address: 'نجف‌آباد، گلدیس شاهین‌شهر، شهرک نگین، خیابان سوم، پلاک ۱۲',
    area: 350,
    landArea: 560,
    rooms: 4,
    bathrooms: 3,
    totalFloors: 3,
    year: 1399,
    parking: 3,
    price: 18_900_000_000n,
    featured: true,
    amenities: ['parking', 'pool', 'gym', 'storage', 'terrace', 'renovated'],
    images: ['villa-1', 'villa-2', 'garden-1'],
  },
  {
    title: 'آپارتمان ۸۵ متری خوزان خمینی‌شهر',
    description:
      'آپارتمان نقلی و دلباز در خوزان خمینی‌شهر، مناسب زوج یا خانواده کوچک. نزدیک به مترو و مراکز خرید، آسانسور و پارکینگ دارد.',
    type: 'apartment',
    transaction: 'mortgage-rent',
    neighborhood: 'khuzan',
    address: 'اصفهان، خوزان خمینی‌شهر، بلوار فردوس شرق، خیابان لاله، پلاک ۹',
    area: 85,
    rooms: 2,
    bathrooms: 1,
    floor: 3,
    totalFloors: 7,
    year: 1392,
    parking: 1,
    deposit: 320_000_000n,
    rent: 18_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'storage', 'central-heating'],
    images: ['apartment-2', 'apartment-4'],
  },
  {
    title: 'آپارتمان ۱۲۰ متری جلفا',
    description:
      'آپارتمان خوش‌نقشه در جلفا با دید کوه، لابی مجلل، سالن اجتماعات و نگهبانی. آفتاب‌گیر و کاملاً بازسازی‌شده.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'jolfa',
    address: 'اصفهان، جلفا، خیابان شهید باهنر، کوچه یاسمن، پلاک ۵',
    area: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 4,
    totalFloors: 8,
    year: 1394,
    parking: 1,
    price: 12_500_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'storage', 'guard', 'renovated'],
    images: ['apartment-3', 'apartment-1'],
  },
  {
    title: 'آپارتمان ۱۴۰ متری سپاهان‌شهر',
    description:
      'واحد کلیدنخورده در برج سپاهان‌شهر با متریال درجه یک، آشپزخانه جزیره‌ای، دو پارکینگ و مشاعات کامل.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'sepahan-shahr',
    address: 'اصفهان، سپاهان‌شهر، خیابان دیباجی شمالی، برج آرامش، طبقه ۹',
    area: 140,
    rooms: 3,
    bathrooms: 2,
    floor: 9,
    totalFloors: 14,
    year: 1401,
    parking: 2,
    price: 18_800_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'storage', 'pool', 'gym', 'guard'],
    images: ['apartment-4', 'kitchen-1'],
  },
  {
    title: 'ویلا ۳۵۰ متری ناژوان',
    description:
      'ویلای دوبلکس با نمای سنگ و چوب، استخر روباز، آلاچیق و باغچه مرتب. دسترسی آسان به جاده اصلی ناژوان.',
    type: 'villa',
    transaction: 'sale',
    neighborhood: 'najvan',
    address: 'اصفهان، ناژوان بزرگ، خیابان امام خمینی، کوچه بهار، پلاک ۳',
    area: 350,
    landArea: 700,
    rooms: 4,
    bathrooms: 3,
    totalFloors: 2,
    year: 1400,
    parking: 2,
    price: 24_500_000_000n,
    amenities: ['parking', 'pool', 'terrace', 'renovated'],
    images: ['villa-2', 'garden-1', 'villa-1'],
  },
  {
    title: 'آپارتمان ۱۱۰ متری سعادت‌آباد اصفهان',
    description:
      'آپارتمان دنج و پرنور در سعادت‌آباد اصفهان با آشپزخانه اپن، بالکن رو به فضای سبز و دسترسی عالی به بزرگراه.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'saadat-abad-isfahan',
    address: 'اصفهان، سعادت‌آباد اصفهان، میدان کاج، خیابان سرو غربی، پلاک ۱۸',
    area: 110,
    rooms: 2,
    bathrooms: 2,
    floor: 5,
    totalFloors: 9,
    year: 1397,
    parking: 1,
    price: 13_900_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'balcony', 'storage'],
    images: ['apartment-1', 'apartment-3'],
  },
  {
    title: 'آپارتمان ۹۵ متری خانه اصفهان',
    description: 'واحد خوش‌نقشه با دید باز به شهر، آسانسور، پارکینگ و انباری. مناسب سکونت خانواده.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'khane-isfahan',
    address: 'اصفهان، خانه اصفهان، خیابان نوزدهم، پلاک ۷',
    area: 95,
    rooms: 2,
    bathrooms: 1,
    floor: 7,
    totalFloors: 12,
    year: 1398,
    parking: 1,
    price: 5_400_000_000n,
    amenities: ['elevator', 'parking', 'storage', 'guard'],
    images: ['apartment-2', 'kitchen-1'],
  },
  {
    title: 'آپارتمان ۷۵ متری مرداویج',
    description: 'واحد جمع‌وجور و تمیز، مناسب زوج، نزدیک به مراکز خرید و مترو.',
    type: 'apartment',
    transaction: 'mortgage-rent',
    neighborhood: 'mardavij',
    address: 'اصفهان، مرداویج، فاز ۲، خیابان ایوانک، پلاک ۴۱',
    area: 75,
    rooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 6,
    year: 1390,
    parking: 1,
    deposit: 280_000_000n,
    rent: 14_500_000n,
    amenities: ['elevator', 'parking', 'central-heating'],
    images: ['apartment-4'],
  },
  {
    title: 'خانه ویلایی ۲۸۰ متری ویلاشهر',
    description: 'خانه ویلایی دوطبقه با حیاط بزرگ، پارکینگ دو ماشین و امکان بازسازی.',
    type: 'house',
    transaction: 'sale',
    neighborhood: 'vilashahr-markazi',
    address: 'نجف‌آباد، ویلاشهر، میدان طالقانی، خیابان گلستان، پلاک ۲۲',
    area: 280,
    landArea: 400,
    rooms: 4,
    bathrooms: 2,
    totalFloors: 2,
    year: 1385,
    parking: 2,
    price: 15_500_000_000n,
    amenities: ['parking', 'storage', 'terrace'],
    images: ['villa-1', 'garden-1'],
  },
  {
    title: 'آپارتمان ۱۰۲ متری جلفا',
    description: 'واحد بازسازی‌شده با نمای مدرن، آشپزخانه جزیره و کمدهای دیواری در تمام اتاق‌ها.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'jolfa',
    address: 'اصفهان، جلفا، خیابان جماران، کوچه صبا، پلاک ۱۴',
    area: 102,
    rooms: 2,
    bathrooms: 2,
    floor: 3,
    totalFloors: 6,
    year: 1395,
    parking: 1,
    price: 12_500_000_000n,
    featured: true,
    amenities: ['elevator', 'parking', 'storage', 'renovated'],
    images: ['apartment-3', 'kitchen-1'],
  },
  {
    title: 'آپارتمان ۷۰ متری یزدانشهر نجف‌آباد',
    description: 'واحد اقتصادی و تمیز، مناسب سرمایه‌گذاری یا سکونت، نزدیک به مترو یزدانشهر نجف‌آباد.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'yazdanshahr',
    address: 'اصفهان، یزدانشهر نجف‌آباد جنوبی، خیابان لاله شرقی، پلاک ۶',
    area: 70,
    rooms: 2,
    bathrooms: 1,
    floor: 4,
    totalFloors: 5,
    year: 1388,
    parking: 0,
    price: 4_200_000_000n,
    status: PropertyStatus.EXPIRED,
    amenities: ['elevator', 'central-heating'],
    images: ['apartment-2'],
  },
  {
    title: 'آپارتمان ۱۱۰ متری در مرداویج (در انتظار بررسی)',
    description: 'واحد سه خوابه رو به آفتاب با آسانسور و پارکینگ، در حال بررسی توسط کارشناسان.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'mardavij',
    address: 'اصفهان، مرداویج، فاز ۳، خیابان مهستان، پلاک ۳۳',
    area: 110,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    totalFloors: 8,
    year: 1399,
    parking: 1,
    price: 16_800_000_000n,
    status: PropertyStatus.PENDING,
    amenities: ['elevator', 'parking', 'storage'],
    images: ['apartment-1'],
  },
  {
    title: 'آپارتمان ۱۱۰ متری مرداویج (رد شده)',
    description: 'واحد دو خوابه با متراژ مناسب. آگهی به دلیل نامشخص بودن تصاویر رد شده است.',
    type: 'apartment',
    transaction: 'sale',
    neighborhood: 'mardavij',
    address: 'اصفهان، مرداویج، فاز ۴، خیابان سیمای ایران، پلاک ۵۱',
    area: 110,
    rooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 5,
    year: 1391,
    parking: 1,
    price: 11_200_000_000n,
    status: PropertyStatus.REJECTED,
    rejectionReason: 'تصاویر بارگذاری‌شده با مشخصات ملک مطابقت ندارد. لطفاً تصاویر واقعی ملک را ثبت کنید.',
    amenities: ['elevator', 'parking'],
    images: ['apartment-4'],
  },
];

async function main(): Promise<void> {
  console.info('🌱 Seeding «سقف من» …');

  for (const [index, type] of PROPERTY_TYPES.entries()) {
    await prisma.propertyType.upsert({
      where: { slug: type.slug },
      create: { ...type, order: index },
      update: { title: type.title, icon: type.icon, order: index },
    });
  }

  for (const [index, transaction] of TRANSACTION_TYPES.entries()) {
    await prisma.transactionType.upsert({
      where: { slug: transaction.slug },
      create: { ...transaction, order: index },
      update: { title: transaction.title, kind: transaction.kind, order: index },
    });
  }

  for (const [index, amenity] of AMENITIES.entries()) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      create: { ...amenity, order: index },
      update: { title: amenity.title, icon: amenity.icon, order: index },
    });
  }

  for (const neighborhood of NEIGHBORHOODS) {
    await prisma.neighborhood.upsert({
      where: { slug: neighborhood.slug },
      create: { ...neighborhood, province: 'اصفهان' },
      update: { title: neighborhood.title, city: neighborhood.city },
    });
  }

  await prisma.companySetting.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      companyName: process.env.COMPANY_NAME ?? 'سقف من',
      tagline: 'مشاور و مجری املاک',
      primaryPhone: process.env.COMPANY_DEFAULT_PHONE ?? '021-91001234',
      secondaryPhone: process.env.COMPANY_SECONDARY_PHONE ?? '021-91001235',
      whatsapp: process.env.COMPANY_WHATSAPP ?? '989120000000',
      workingHours: process.env.COMPANY_WORKING_HOURS ?? 'همه‌روزه از ۹ صبح تا ۹ شب پاسخگو هستیم',
      address: 'اصفهان، مرداویج، بلوار فرحزادی، پلاک ۱',
    },
    update: {},
  });

  const admin = await prisma.user.upsert({
    where: { phone: '09120000000' },
    create: { phone: '09120000000', fullName: 'مدیر سامانه', role: UserRole.ADMIN, city: 'اصفهان' },
    update: { role: UserRole.ADMIN },
  });

  const owner = await prisma.user.upsert({
    where: { phone: '09123456789' },
    create: { phone: '09123456789', fullName: 'محمد رضایی', city: 'اصفهان', email: 'm.rezaei@email.com' },
    update: {},
  });

  const secondOwner = await prisma.user.upsert({
    where: { phone: '09121112233' },
    create: { phone: '09121112233', fullName: 'سارا احمدی', city: 'نجف‌آباد' },
    update: {},
  });

  const types = await prisma.propertyType.findMany();
  const transactions = await prisma.transactionType.findMany();
  const neighborhoods = await prisma.neighborhood.findMany();
  const amenities = await prisma.amenity.findMany();

  let code = 12300;
  for (const [index, seed] of SEED_PROPERTIES.entries()) {
    code += 7;
    const type = types.find((t) => t.slug === seed.type)!;
    const transaction = transactions.find((t) => t.slug === seed.transaction)!;
    const neighborhood = neighborhoods.find((n) => n.slug === seed.neighborhood)!;
    const status = seed.status ?? PropertyStatus.PUBLISHED;
    const slug = `${type.slug}-${seed.area}m-${neighborhood.slug}-${code}`;
    const ownerId = index % 3 === 2 ? secondOwner.id : owner.id;

    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.property.create({
      data: {
        slug,
        code: String(code),
        title: seed.title,
        description: seed.description,
        ownerId,
        propertyTypeId: type.id,
        transactionTypeId: transaction.id,
        neighborhoodId: neighborhood.id,
        address: seed.address,
        displayAddress: `${neighborhood.city}، ${neighborhood.title}`,
        showExactLocation: false,
        latitude: neighborhood.lat ?? null,
        longitude: neighborhood.lng ?? null,
        area: seed.area,
        landArea: seed.landArea ?? null,
        rooms: seed.rooms,
        bathrooms: seed.bathrooms ?? null,
        floor: seed.floor ?? null,
        totalFloors: seed.totalFloors ?? null,
        constructionYear: seed.year ?? null,
        parkingCount: seed.parking ?? 0,
        hasElevator: seed.amenities.includes('elevator'),
        hasStorage: seed.amenities.includes('storage'),
        hasBalcony: seed.amenities.includes('balcony'),
        deedType: DeedType.SIX_DANG,
        price: seed.price ?? null,
        pricePerMeter: seed.price ? seed.price / BigInt(seed.area) : null,
        deposit: seed.deposit ?? null,
        monthlyRent: seed.rent ?? null,
        isFeatured: seed.featured ?? false,
        status,
        rejectionReason: seed.rejectionReason ?? null,
        viewCount: 20 + ((index * 37) % 260),
        publishedAt: status === PropertyStatus.PUBLISHED ? new Date(Date.now() - index * 86_400_000) : null,
        expiresAt:
          status === PropertyStatus.PUBLISHED ? new Date(Date.now() + (30 - index) * 86_400_000) : null,
        images: {
          create: seed.images.map((name, imageIndex) => ({
            url: `/images/seed/${name}.jpg`,
            alt: seed.title,
            isCover: imageIndex === 0,
            order: imageIndex,
            width: 1600,
            height: 1067,
          })),
        },
        amenities: {
          create: seed.amenities
            .map((slugName) => amenities.find((a) => a.slug === slugName))
            .filter((a): a is (typeof amenities)[number] => Boolean(a))
            .map((a) => ({ amenityId: a.id })),
        },
        statusHistory: { create: { toStatus: status, changedById: admin.id } },
      },
    });
  }

  const published = await prisma.property.findMany({
    where: { status: PropertyStatus.PUBLISHED },
    select: { id: true },
    take: 6,
  });
  for (const property of published.slice(0, 4)) {
    await prisma.favorite.upsert({
      where: { userId_propertyId: { userId: owner.id, propertyId: property.id } },
      create: { userId: owner.id, propertyId: property.id },
      update: {},
    });
  }

  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        title: 'ثبت آگهی در سقف من رایگان است',
        message:
          'ملک خود را در اصفهان، خمینی‌شهر، شاهین‌شهر، نجف‌آباد و ویلاشهر ثبت کنید؛ کارشناسان ما آن را بررسی و منتشر می‌کنند.',
        variant: 'promo',
        ctaLabel: 'ثبت آگهی',
        linkUrl: '/submit-property',
        position: 'home-top',
        isActive: true,
        dismissible: true,
      },
    });
  }

  console.info('✅ Seed complete.');
  console.info('   Admin login phone: 09120000000  (OTP is printed in the API log)');
  console.info('   Demo user phone:   09123456789');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
