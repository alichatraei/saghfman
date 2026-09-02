/**
 * Coverage area of «سقف من»: the city of Isfahan and the four satellite towns
 * around it. Neighbourhood lists are seeded into the `Neighborhood` table, so
 * the admin can add or rename entries later without touching this file.
 */

export interface CitySeed {
  slug: string;
  title: string;
  province: string;
  lat: number;
  lng: number;
}

export interface NeighborhoodSeed {
  slug: string;
  title: string;
  city: string;
}

export const CITIES: CitySeed[] = [
  { slug: 'isfahan', title: 'اصفهان', province: 'اصفهان', lat: 32.6546, lng: 51.668 },
  { slug: 'khomeyni-shahr', title: 'خمینی‌شهر', province: 'اصفهان', lat: 32.6853, lng: 51.5334 },
  { slug: 'shahin-shahr', title: 'شاهین‌شهر', province: 'اصفهان', lat: 32.8649, lng: 51.5522 },
  { slug: 'najafabad', title: 'نجف‌آباد', province: 'اصفهان', lat: 32.634, lng: 51.3667 },
  { slug: 'vilashahr', title: 'ویلاشهر', province: 'اصفهان', lat: 32.6717, lng: 51.4056 },
];

/** Isfahan — the main districts and neighbourhoods used in listings. */
const ISFAHAN: [string, string][] = [
  ['jolfa', 'جلفا'],
  ['chaharbagh-bala', 'چهارباغ بالا'],
  ['chaharbagh-abbasi', 'چهارباغ عباسی'],
  ['amadegah', 'آمادگاه'],
  ['sheikh-sadooq', 'شیخ صدوق'],
  ['sheikh-bahaei', 'شیخ بهایی'],
  ['mollasadra', 'ملاصدرا'],
  ['tohid', 'توحید'],
  ['hezar-jarib', 'هزارجریب'],
  ['mardavij', 'مرداویج'],
  ['kaveh', 'کاوه'],
  ['bozorgmehr', 'بزرگمهر'],
  ['hakim-nezami', 'حکیم نظامی'],
  ['ahmadabad', 'احمدآباد'],
  ['parvin', 'پروین'],
  ['sepahan-shahr', 'سپاهان‌شهر'],
  ['malek-shahr', 'ملک‌شهر'],
  ['khane-isfahan', 'خانه اصفهان'],
  ['rahnan', 'رهنان'],
  ['najvan', 'ناژوان'],
  ['amiriyeh', 'امیریه'],
  ['shahrak-valiasr', 'شهرک ولیعصر'],
  ['ghaemiyeh', 'قائمیه'],
  ['atashgah', 'آتشگاه'],
  ['bagh-ziar', 'باغ زیار'],
  ['khorasgan', 'خوراسگان'],
  ['zeinabiyeh', 'زینبیه'],
  ['arghavaniyeh', 'ارغوانیه'],
  ['ashegh-abad', 'عاشق‌آباد'],
  ['sichan', 'سیچان'],
  ['darvazeh-shiraz', 'دروازه شیراز'],
  ['bakhtiar-dasht', 'بختیاردشت'],
  ['dorche', 'درچه'],
  ['jey', 'جی'],
  ['shahrestan', 'شهرستان'],
  ['baharestan-isfahan', 'بهارستان'],
  ['shams-abad', 'شمس‌آباد'],
  ['dastgerdeh', 'دستگرده'],
  ['mir-emad', 'میرعماد'],
  ['shahriyar', 'شهریار'],
  ['abshar', 'آبشار'],
  ['saadat-abad-isfahan', 'سعادت‌آباد'],
];

/** خمینی‌شهر — grown out of the three old villages Khuzan, Forushan, Varnosfaderan. */
const KHOMEYNI_SHAHR: [string, string][] = [
  ['khuzan', 'خوزان'],
  ['forushan', 'فروشان'],
  ['varnosfaderan', 'ورنوسفادران'],
  ['andan', 'اندان'],
  ['dastgerd-khomeyni', 'دستگرد'],
  ['jooy-abad', 'جوی‌آباد'],
  ['kahandej', 'کهندژ'],
  ['manzariyeh', 'منظریه'],
  ['haftsad-dastgah', 'هفتصد دستگاه'],
  ['ghaemiyeh-khomeyni', 'قائمیه'],
  ['pasdaran-khomeyni', 'پاسداران'],
  ['bagherol-oloom', 'کوی باقرالعلوم'],
  ['amirkabir', 'امیرکبیر'],
  ['boali', 'بوعلی'],
  ['montazeri-shomali', 'منتظری شمالی'],
  ['montazeri-jonoubi', 'منتظری جنوبی'],
  ['shariati-khomeyni', 'شریعتی'],
  ['darcheh-piaz', 'درچه پیاز'],
  ['asghar-abad', 'اصغرآباد'],
  ['kooshk', 'کوشک'],
];

/** شاهین‌شهر — the grid of numbered lanes around its named avenues. */
const SHAHIN_SHAHR: [string, string][] = [
  ['mokhaberat', 'مخابرات'],
  ['ferdowsi-shahin', 'فردوسی'],
  ['hafez-shahin', 'حافظ'],
  ['dehkhoda', 'دهخدا'],
  ['attar', 'عطار'],
  ['saadi-shahin', 'سعدی'],
  ['razi', 'رازی'],
  ['shariati-shahin', 'شریعتی'],
  ['mokanik', 'مکانیک'],
  ['goldis', 'گلدیس'],
  ['hasht-behesht', 'هشت بهشت'],
  ['milad', 'میلاد'],
  ['jomhouri', 'جمهوری'],
  ['parastar', 'پرستار'],
  ['site', 'سایت'],
  ['tohid-shahin', 'توحید'],
  ['tabatabaei', 'طباطبایی'],
  ['eghbal-lahouri', 'اقبال لاهوری'],
  ['sayad-shirazi', 'صیاد شیرازی'],
  ['khanehaye-choobi', 'خانه‌های چوبی'],
  ['gorgab', 'گرگاب'],
  ['manzariyeh-shahin', 'منظریه'],
];

/** نجف‌آباد — the five municipal zones plus the satellite quarters. */
const NAJAFABAD: [string, string][] = [
  ['emam-khomeyni-najafabad', 'خیابان امام خمینی'],
  ['montazeri-najafabad', 'منتظری'],
  ['taleghani-najafabad', 'طالقانی'],
  ['shariati-najafabad', 'شریعتی'],
  ['beheshti-najafabad', 'بهشتی'],
  ['ferdowsi-najafabad', 'فردوسی'],
  ['modares-najafabad', 'مدرس'],
  ['shohada-najafabad', 'شهدا'],
  ['yazdanshahr', 'یزدانشهر'],
  ['amir-abad', 'امیرآباد'],
  ['saleh-abad', 'صالح‌آباد'],
  ['firouz-abad', 'فیروزآباد'],
  ['sheikh-abad', 'شیخ‌آباد (بهارستان)'],
  ['kahrizsang', 'کهریزسنگ'],
  ['jouzdan', 'جوزدان'],
  ['goldasht', 'گلدشت'],
  ['hosein-abad-najafabad', 'حسین‌آباد'],
];

/** ویلاشهر — satellite town north-east of Najafabad. */
const VILASHAHR: [string, string][] = [
  ['vilashahr-markazi', 'مرکز شهر'],
  ['bahonar-vilashahr', 'باهنر'],
  ['shahid-madadi', 'شهید مددی'],
  ['tondgouyan', 'تندگویان'],
  ['isar', 'ایثار'],
  ['moallem-vilashahr', 'بلوار معلم'],
  ['emam-khomeyni-vilashahr', 'بلوار امام خمینی'],
  ['emam-reza-vilashahr', 'کوی امام رضا'],
  ['apadana', 'شهرک آپادانا'],
  ['faz-yek', 'فاز ۱'],
  ['faz-do', 'فاز ۲'],
  ['faz-se', 'فاز ۳'],
];

const build = (entries: [string, string][], city: string): NeighborhoodSeed[] =>
  entries.map(([slug, title]) => ({ slug, title, city }));

export const NEIGHBORHOODS: NeighborhoodSeed[] = [
  ...build(ISFAHAN, 'اصفهان'),
  ...build(KHOMEYNI_SHAHR, 'خمینی‌شهر'),
  ...build(SHAHIN_SHAHR, 'شاهین‌شهر'),
  ...build(NAJAFABAD, 'نجف‌آباد'),
  ...build(VILASHAHR, 'ویلاشهر'),
];
