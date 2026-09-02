# معماری «سقف من»

سندی که پیش از پیاده‌سازی توافق شد: معماری، موجودیت‌های دیتابیس، نقشه مسیرها، درخت
کامپوننت‌ها، ساختار پوشه‌ها و مراحل اجرا.

---

## ۱. پیشنهاد معماری

```
                    ┌──────────────────────────────┐
  مرورگر / PWA ───► │  apps/web — Next.js 14 (App) │
                    │  SSR/ISR • RTL • Tailwind    │
                    └───────────┬──────────────────┘
                                │ REST (JSON, HttpOnly cookie + Bearer)
                    ┌───────────▼──────────────────┐
                    │  apps/api — NestJS 10        │
                    │  Auth • Properties • Admin   │
                    │  Serializer لایه حریم خصوصی  │
                    └───────────┬──────────────────┘
                                │ Prisma 5
                    ┌───────────▼──────────────────┐
                    │  PostgreSQL 16               │
                    └──────────────────────────────┘
      packages/types  ← قراردادهای مشترک TypeScript (بدون Prisma)
      packages/config ← توکن‌های طراحی و ثابت‌های دامنه
```

**تصمیم‌های کلیدی**

| موضوع | تصمیم | دلیل |
| --- | --- | --- |
| رندر | SSR/ISR برای صفحه اصلی، لیست و جزئیات | سئو و سرعت اولین رنگ‌آمیزی |
| احراز هویت | موبایل + OTP، Access JWT کوتاه‌عمر + Refresh در کوکی HttpOnly | بدون رمز عبور، مقاوم در برابر XSS |
| پیامک | اینترفیس `SmsProvider` + پیاده‌سازی mock/Kavenegar/SMS.ir/Melipayamak | تعویض سرویس بدون تغییر منطق |
| حریم خصوصی | سه DTO مجزا: `PublicProperty` / `MyProperty` / `AdminProperty` | شماره مالک هرگز از دیتابیس هم خوانده نمی‌شود |
| تصاویر | آپلود → `sharp` → WebP ۱۹۲۰px + بندانگشتی ۶۴۰px | حذف EXIF/GPS، حجم کمتر، LCP بهتر |
| قیمت‌ها | `BigInt` در دیتابیس، `string` در API | جلوگیری از سرریز عددی در ارقام میلیاردی |

### لایه حریم خصوصی (الزام سخت پروژه)

سه سد مستقل:

1. **انتخاب داده** — `publicPropertySelect` اصلاً رابطهٔ `owner` و ستون `address` را select
   نمی‌کند؛ داده خصوصی از PostgreSQL خارج نمی‌شود.
2. **نگاشت صریح** — مپرها فیلد‌به‌فیلد DTO می‌سازند (بدون spread)، پس ستون جدید اسکیمـا
   به‌طور ناخواسته منتشر نمی‌شود.
3. **تست رگرسیون** — `apps/api/src/modules/properties/tests/public-property-privacy.spec.ts`
   بررسی می‌کند هیچ کلید ممنوعه‌ای در خروجی عمومی نباشد و شماره منتشرشده همان شماره شرکت
   (از جدول `CompanySetting`) باشد.

شمارهٔ نمایشی روی سایت از `CompanySetting.primaryPhone` می‌آید و در پنل مدیریت
(`/admin/settings/contact`) قابل ویرایش است — در فرانت‌اند هیچ شماره‌ای هاردکد نشده است.

---

## ۲. موجودیت‌های دیتابیس

| موجودیت | نقش | نکات |
| --- | --- | --- |
| `User` | کاربر/مالک/کارشناس | `phone` یکتا و **خصوصی**، `role`, `status`, تنظیمات اعلان |
| `OtpCode` | کد یکبار مصرف | هش‌شده، تعداد تلاش، انقضا |
| `RefreshToken` | نشست‌ها | هش argon2، قابل ابطال |
| `PropertyType` / `TransactionType` | تاکسونومی نوع ملک و معامله | slug پایدار برای URL |
| `Neighborhood` | محله/شهر | مختصات مرکز محله |
| `Amenity` + `PropertyAmenity` | امکانات (چند‌به‌چند) | |
| `Property` | آگهی | `address` خصوصی، `displayAddress` عمومی، `status`, `isFeatured`, قیمت‌های BigInt |
| `PropertyImage` | تصاویر | کاور، ترتیب، ابعاد |
| `Favorite` | علاقه‌مندی | یکتا بر (user, property) |
| `PropertyView` | بازدید | اثر انگشت هش‌شده به‌جای IP خام |
| `PropertyStatusHistory` | تاریخچه تغییر وضعیت | دلیل رد، کاربر تغییردهنده |
| `CompanySetting` | اطلاعات تماس شرکت | تک‌رکورد `default` |
| `Notification` | اعلان کاربر | تأیید/رد/انقضای آگهی |
| `AdminAuditLog` | ثبت اقدامات مدیران | |
| `Banner` | بنرهای صفحه اصلی | |

---

## ۳. نقشه مسیرها

### وب

| مسیر | نوع | توضیح |
| --- | --- | --- |
| `/` | SSR/ISR | هیرو، جستجو، ۴ کارت نیت، آگهی‌های ویژه، چرا سقف من |
| `/properties` | SSR | فیلتر، مرتب‌سازی، صفحه‌بندی |
| `/properties/[slug]` | ISR | گالری، مشخصات، امکانات، نقشه، **تماس با شرکت**، مشابه‌ها، JSON-LD |
| `/auth` | Client | موبایل → کد تأیید با شمارش معکوس |
| `/submit-property` | Client | ویزارد سه مرحله‌ای + پیش‌نویس + پیش‌نمایش |
| `/account/listings` | Client | تب وضعیت، تمدید/غیرفعال/حذف، دلیل رد |
| `/account/listings/[id]/edit` | Client | فرم ویرایش آگهی (بازگشت خودکار به صف بررسی) |
| `/account/favorites` | Client | شبکه ملک‌های ذخیره‌شده |
| `/account/profile` | Client | اطلاعات شخصی، اعلان‌ها، یادداشت حریم خصوصی |
| `/admin` | Client (لایه مجزا) | داشبورد آمار |
| `/admin/properties` | Client | جدول آگهی‌ها **همراه شماره مالک**، تأیید/رد/ویژه/انقضا/حذف |
| `/admin/users` | Client | فعال/تعلیق/مسدود |
| `/admin/settings/contact` | Client | ویرایش شماره‌های شرکت |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | تولیدی | سئو و PWA |

### API (پیشوند `/api`)

```
POST   /auth/request-otp          POST /auth/verify-otp
POST   /auth/refresh              POST /auth/logout            GET /auth/me
GET    /properties                GET  /properties/featured    GET /properties/sitemap
GET    /properties/:slug          GET  /properties/:slug/similar
POST   /properties                PATCH /properties/:id        DELETE /properties/:id
PATCH  /properties/:id/renew|deactivate|activate
GET    /me/properties             GET  /me/properties/:id      GET /me/notifications
GET/PATCH /me/profile
GET    /me/favorites              POST/DELETE /favorites/:propertyId
GET    /taxonomy/property-types|transaction-types|neighborhoods|amenities
GET    /settings/contact          PATCH /admin/settings/contact
POST   /uploads/images
GET    /admin/dashboard           GET  /admin/properties       GET /admin/properties/:id
PATCH  /admin/properties/:id/approve|reject|feature|expire     DELETE /admin/properties/:id
GET    /admin/users               PATCH /admin/users/:id/status
GET    /api/docs   (Swagger)
```

---

## ۴. درخت کامپوننت‌ها

```
RootLayout (lang=fa dir=rtl, Vazirmatn, Providers)
├─ (site)/layout           SiteHeader · SiteFooter
│  ├─ page                 SearchBar · IntentCards · PropertyGrid · WhyUs
│  ├─ properties/page      SearchBar · FiltersSidebar | MobileFilters · SortToolbar
│  │                       PropertyGrid → PropertyCard → FavoriteButton · Pagination
│  ├─ properties/[slug]    Gallery · specs · amenities · PropertyMap
│  │                       ContactCard · StickyContactBar · PropertyGrid(similar)
│  ├─ auth/page            AuthPanel (phone → OTP)
│  ├─ submit-property      SubmitWizard → Stepper · ImageUploader · preview
│  └─ account/layout       AccountNav · RequireAuth
│     ├─ listings          status tabs · listing rows · Modal(delete) · summary
│     ├─ favorites         PropertyGrid
│     └─ profile           Toggle · Input · privacy note
└─ admin/layout            AdminShell (نویگیشن مجزا، گارد نقش)
   ├─ page                 StatCards · نمودار بازدید · صف بررسی
   ├─ properties           جدول + Modal رد/حذف
   ├─ users                جدول + تغییر وضعیت
   └─ settings/contact     فرم اطلاعات تماس + پیش‌نمایش

UI پایه: Button/LinkButton · Input/Select/Textarea/Toggle/Checkbox · Badge
         Skeleton/EmptyState/ErrorState · Modal
```

---

## ۵. ساختار پوشه‌ها

```
saghf-man/
├─ apps/
│  ├─ api/           NestJS + Prisma
│  │  ├─ prisma/     schema.prisma · seed.ts
│  │  └─ src/
│  │     ├─ common/  prisma · guards · decorators · filters · utils
│  │     ├─ config/  app.config.ts
│  │     └─ modules/ auth(+sms) · properties(+tests) · favorites · me · users
│  │                 taxonomy · settings · uploads · admin · maintenance
│  └─ web/           Next.js App Router
│     ├─ app/        (site)/… · admin/… · sitemap · robots
│     ├─ components/ ui · layout · property · home · submit · account · admin · auth
│     ├─ lib/        api · auth-store · hooks · providers · format · cn
│     └─ public/     manifest · icons · fonts · images/seed
├─ packages/
│  ├─ types/         قراردادهای مشترک
│  └─ config/        توکن‌های طراحی + ثابت‌های دامنه
├─ docker-compose.yml · .env.example · README.md · ARCHITECTURE.md
```

---

## ۶. مراحل اجرا

| مرحله | خروجی | وضعیت |
| --- | --- | --- |
| M1 | مونوریپو، توکن‌ها، تایپ‌های مشترک، ESLint/Prettier/TS strict | ✅ |
| M2 | اسکیمای Prisma + seed واقعی فارسی | ✅ |
| M3 | احراز هویت OTP + JWT + لایه SMS | ✅ |
| M4 | API آگهی‌ها + **لایه حریم خصوصی + تست** | ✅ |
| M5 | آپلود تصویر (WebP)، علاقه‌مندی‌ها، پروفایل، تاکسونومی | ✅ |
| M6 | پنل مدیریت: داشبورد، بررسی آگهی، کاربران، تنظیمات تماس | ✅ |
| M7 | فرانت عمومی: خانه، لیست، جزئیات، ورود، ویزارد ثبت | ✅ |
| M8 | حساب کاربری + پنل مدیریت در وب | ✅ |
| M9 | سئو (sitemap/robots/JSON-LD)، PWA، دسترس‌پذیری، RTL | ✅ |
| M10 | Docker، مستندات استقرار روی DirectAdmin/PM2/Nginx | ✅ |
| M11 | ویرایش آگهی توسط مالک + کارهای زمان‌بندی‌شده (انقضا و پاک‌سازی) | ✅ |

---

## ۷. کارهای زمان‌بندی‌شده (`modules/maintenance`)

| زمان‌بندی | کار |
| --- | --- |
| هر ساعت | آگهی‌های منتشرشده‌ای که `expiresAt` آن‌ها گذشته → `EXPIRED` + ثبت تاریخچه + اعلان به مالک |
| هر روز ۰۳:۰۰ | حذف کدهای OTP مصرف‌شده/منقضی قدیمی‌تر از ۲۴ ساعت |
| هر روز ۰۴:۰۰ | حذف Refresh Tokenهای باطل‌شده قدیمی‌تر از ۷ روز |
| هفتگی | حذف رکوردهای خام بازدید قدیمی‌تر از ۹۰ روز (شمارنده روی `Property` باقی می‌ماند) |

همه این کارها idempotent هستند؛ اجرای دوباره یا ری‌استارت سرویس داده‌ای را خراب نمی‌کند.
