# سقف من (Saghf-e Man)

سامانه تخصصی املاک — خرید، فروش و اجاره ملک. مونوریپو با **Next.js 14** (وب/PWA)،
**NestJS 10** (API) و **PostgreSQL + Prisma**، کاملاً فارسی و RTL.

> **الزام امنیتی پروژه:** شماره موبایل مالک در هیچ صفحه یا پاسخ عمومی API ظاهر نمی‌شود.
> روی همه صفحات فقط شماره شرکت (قابل تغییر در پنل مدیریت) نمایش داده می‌شود.
> جزئیات در `ARCHITECTURE.md` بخش «لایه حریم خصوصی».

---

## پیش‌نیازها

- Node.js **۲۰ به بالا**
- PostgreSQL **۱۴ به بالا**
- (اختیاری) Docker و Docker Compose

## راه‌اندازی سریع

```bash
cp .env.example .env          # مقادیر را ویرایش کنید
npm install                   # نصب کل ورک‌اسپیس‌ها
npm run db:generate           # تولید Prisma Client
npm run db:migrate            # ساخت جداول
npm run db:seed               # داده نمونه فارسی
npm run dev                   # api روی :4000 و web روی :3000
```

- وب: <http://localhost:3000>
- مستندات API (Swagger): <http://localhost:4000/api/docs>

### حساب‌های نمونه

| نقش | شماره | توضیح |
| --- | --- | --- |
| مدیر کل | `09120000000` | دسترسی به `/admin` |
| کاربر عادی | `09123456789` | چند آگهی و علاقه‌مندی |

در حالت `SMS_PROVIDER=mock` کد ورود در لاگ API چاپ می‌شود و در پاسخ
`POST /api/auth/request-otp` نیز به‌صورت `devCode` برمی‌گردد (فقط در توسعه).

---

## متغیرهای محیطی مهم

| متغیر | نمونه | توضیح |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://saghf:pass@localhost:5432/saghf_man` | اتصال دیتابیس |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | رشته تصادفی ۳۲+ کاراکتری | حتماً در production تغییر دهید |
| `OTP_LENGTH` / `OTP_TTL_SECONDS` | `5` / `120` | طول و اعتبار کد |
| `SMS_PROVIDER` | `mock` \| `kavenegar` \| `smsir` \| `melipayamak` | انتخاب درگاه پیامک |
| `SMS_API_KEY` / `SMS_SENDER` / `SMS_TEMPLATE` | — | اعتبارنامه درگاه |
| `UPLOAD_PATH` | `./uploads` | محل ذخیره تصاویر |
| `COMPANY_DEFAULT_PHONE` | `021-91001234` | فقط مقدار اولیه seed؛ منبع اصلی جدول `CompanySetting` است |
| `NEXT_PUBLIC_API_URL` | `https://example.com/api` | آدرس API برای مرورگر |
| `NEXT_PUBLIC_SITE_URL` | `https://example.com` | برای canonical و sitemap |

## دستورات

| دستور | کار |
| --- | --- |
| `npm run dev` | اجرای هم‌زمان API و وب |
| `npm run build` | بیلد کامل (types → config → api → web) |
| `npm run start` | اجرای نسخه production |
| `npm run db:migrate` / `db:deploy` / `db:seed` | مدیریت دیتابیس |
| `npm run test` | تست‌های API (شامل تست حریم خصوصی) |
| `npm run lint` / `npm run format` | ESLint و Prettier |

---

## افزودن درگاه پیامک جدید

۱. کلاسی بسازید که `SmsProvider` را پیاده کند
   (`apps/api/src/modules/auth/sms/sms-provider.interface.ts`).
۲. آن را در `createSmsProvider` داخل `sms.module.ts` به switch اضافه کنید.
۳. مقدار `SMS_PROVIDER` را در `.env` تنظیم کنید. هیچ تغییری در `AuthService` لازم نیست.

## فونت‌ها

فایل‌های وزیرمتن را در `apps/web/public/fonts/` قرار دهید (راهنما در همان پوشه).
تا آن زمان از CDN به‌عنوان fallback استفاده می‌شود.

---

## استقرار با Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec api npx prisma db seed --schema apps/api/prisma/schema.prisma
```

سرویس‌ها: `db` (۵۴۳۲)، `api` (۴۰۰۰)، `web` (۳۰۰۰). تصاویر آپلودی در والیوم `uploads`.

## استقرار روی سرور DirectAdmin (بدون Docker)

۱. **دیتابیس:** در DirectAdmin یک دیتابیس PostgreSQL و کاربر بسازید و `DATABASE_URL`
   را در `.env` بگذارید. (اگر PostgreSQL نصب نیست، از بخش Custom Build یا مدیر سرور
   بخواهید `postgresql-server` نصب شود.)

۲. **آپلود کد و بیلد:**

```bash
cd ~/domains/example.com/private/saghf-man
npm install
npm run db:deploy
npm run db:seed        # فقط بار اول
npm run build
```

۳. **اجرای دائمی با PM2:**

```bash
npm i -g pm2
pm2 start "npm run start:prod -w @saghf/api" --name saghf-api
pm2 start "npm run start -w @saghf/web"      --name saghf-web
pm2 save && pm2 startup
```

۴. **Nginx (Custom HTTPD Config در DirectAdmin):**

```nginx
location /api/ {
    proxy_pass         http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    client_max_body_size 20m;
}

location / {
    proxy_pass         http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade    $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host       $host;
}
```

۵. **SSL:** از بخش SSL Certificates در DirectAdmin گواهی Let's Encrypt را فعال کنید و
   `NEXT_PUBLIC_SITE_URL` و `CORS_ORIGINS` را با `https://` به‌روز کنید.

۶. **پشتیبان‌گیری:** `pg_dump` روزانه + آرشیو پوشه `uploads`.

### چک‌لیست production

- [ ] `JWT_SECRET` و `JWT_REFRESH_SECRET` تصادفی و جدید
- [ ] `SMS_PROVIDER` روی درگاه واقعی (نه `mock`)
- [ ] `CORS_ORIGINS` فقط دامنه سایت
- [ ] `COOKIE_DOMAIN` برابر دامنه اصلی
- [ ] فونت‌های وزیرمتن self-host شده
- [ ] شماره تماس شرکت از `/admin/settings/contact` تنظیم شده
- [ ] اجرای `npm run test` (تست حریم خصوصی سبز باشد)

---

## کارهای خودکار

سرویس API با `@nestjs/schedule` چهار کار دوره‌ای اجرا می‌کند: انقضای خودکار آگهی‌های
قدیمی (ساعتی) و پاک‌سازی OTP، Refresh Token و رکوردهای بازدید. جزئیات در
`ARCHITECTURE.md` بخش ۷.

## ساختار پروژه

جزئیات کامل معماری، موجودیت‌ها، نقشه مسیرها و درخت کامپوننت‌ها در
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

```
apps/web      Next.js 14 (App Router, RTL, PWA)
apps/api      NestJS 10 + Prisma + PostgreSQL
packages/types   قراردادهای مشترک TypeScript
packages/config  توکن‌های طراحی و ثابت‌های دامنه
```

---

ساخته‌شده توسط **تیم برنامه‌نویسی آ**

## به‌روزرسانی شهریور — پرسشنامه آگهی و پیام‌رسان‌ها

- جستجوی صفحه اصلی به دو حالت «خرید و فروش» و «اجاره» تقسیم شد؛ در حالت اجاره
  محدوده مبلغ روی **ودیعه** اعمال می‌شود (`transactionGroup`, `minDeposit`, `maxDeposit`).
- فرم ثبت/ویرایش آگهی: گرمایش، سرمایش، کابینت، کف‌پوش، پوشش دیوار، مساحت سالن، و
  آسانسور/پارکینگ/انباری/تراس به‌صورت دارد–ندارد. «متراژ زمین» فقط برای ویلا، خانه،
  زمین و باغ نمایش داده می‌شود.
- آگهی اجاره: طبقه اجباری، نقشه حذف شده (فقط منطقه و خیابان)، نوع سند پرسیده نمی‌شود.
- محدودیت‌ها: عنوان حداکثر ۴۰ کاراکتر، توضیحات حداقل ۴۰۰ کاراکتر (با شمارنده زنده)،
  حداکثر ۱۵ تصویر.
- تنظیمات ادمین: تلگرام، واتساپ، روبیکا، بله، ایتا و اینستاگرام — که در فوتر و کارت
  «تماس با شرکت» نمایش داده می‌شوند.

پس از دریافت این نسخه، یک‌بار مایگریشن را اجرا کنید:

```bash
npm run db:migrate      # یا در سرور: npm run db:deploy
```

### ویرایش آگهی از پنل مدیریت

مسیر `/admin/properties/[id]/edit` همان فرم ویرایش مالک را با `mode="admin"` نمایش می‌دهد:
پیش‌پر شدن از `GET /admin/properties/:id` انجام می‌شود و ذخیره از طریق
`PATCH /properties/:id`. برخلاف ویرایش مالک، ویرایش مدیر وضعیت انتشار را به
«در انتظار بررسی» برنمی‌گرداند. دکمه ویرایش در همان ردیف/کارت آگهی، کنار
تأیید/رد/ویژه/حذف قرار دارد.

## ویرایش آگهی از پنل مدیریت

مسیر `/admin/properties/[id]/edit` همان فرم ویرایش کاربر است که با `mode="admin"`
اجرا می‌شود. تفاوت‌ها:

- داده اولیه از `GET /admin/properties/:id` می‌آید (شامل توضیحات، امکانات، آدرس
  دقیق و همه فیلدهای فنی).
- ویرایش توسط کارشناس، وضعیت انتشار را عوض نمی‌کند؛ فقط ویرایش خودِ مالک آگهی را
  دوباره به صف «در انتظار بررسی» می‌فرستد.
- انتشار، رد، ویژه‌کردن و حذف همچنان از جدول `/admin/properties` انجام می‌شود.

> نکته امنیتی: `adminPropertySelect` تنها انتخابی است که `owner.phone` را می‌خواند و
> فقط از مسیرهای نقش‌دار `/admin` قابل دسترسی است. تست‌های
> `public-property-privacy.spec.ts` این مرز را پوشش می‌دهند.

## به‌روزرسانی: منطقه پوشش اصفهان

- شهرهای تحت پوشش: **اصفهان، خمینی‌شهر، شاهین‌شهر، نجف‌آباد، ویلاشهر**. فهرست شهرها و
  محله‌ها در `packages/config/src/locations.ts` است و با `npm run db:seed` داخل جدول
  `Neighborhood` نوشته می‌شود؛ افزودن یا تغییر محله بعداً فقط یک رکورد دیتابیس است.
- در فرم ثبت و ویرایش آگهی ابتدا **شهر** انتخاب می‌شود و سلکت **محله** فقط محله‌های
  همان شهر را نشان می‌دهد (`GET /taxonomy/cities` و
  `GET /taxonomy/neighborhoods?city=...`).
- در آگهی اجاره، «قیمت توافقی» و «امکان معاوضه» نمایش داده نمی‌شوند و همیشه `false`
  ارسال می‌شوند.
- توضیحات: حداکثر **۷۰۰** کاراکتر، بدون حداقل. شمارنده زیر کادر، تعداد نوشته‌شده را
  نشان می‌دهد.
- کارت تماس آگهی: «درخواست مشاوره» حذف شد و به‌جای «پیام در واتساپ»، **تلفن پیام‌رسان**
  نمایش داده می‌شود (فیلد `messengerPhone` در تنظیمات ادمین؛ اگر خالی باشد شماره واتساپ
  استفاده می‌شود).

مایگریشن جدید: `20260901120000_messenger_phone`. پس از دریافت این نسخه:

```bash
npm install
npm run build -w @saghf/types && npm run build -w @saghf/config
npm run db:generate && npm run db:migrate && npm run db:seed
```

## بنر صفحه اصلی

- مسیر مدیریت: `/admin/banners` — ساخت، ویرایش، فعال/غیرفعال کردن و حذف بنر.
- برای هر بنر می‌توان عنوان، متن، نوع نمایش (اطلاع‌رسانی / موفقیت / هشدار / تبلیغاتی)،
  متن و لینک دکمه، ترتیب، «قابل بستن بودن» و **بازه زمانی نمایش** (شروع و پایان) را
  تعیین کرد. تاریخ خالی یعنی بدون محدودیت.
- API: `GET /api/banners?position=home-top` (عمومی، فقط بنرهای فعال و داخل بازه) و
  `GET/POST/PATCH/DELETE /api/admin/banners` (نقش‌های ADMIN و MANAGER).
- بنر بالای صفحه اصلی رندر می‌شود و کاربر می‌تواند آن را ببندد (در `localStorage` ذخیره
  می‌شود). مایگریشن: `20260901140000_banner_content`.

## حق نشر و نام توسعه‌دهنده

- فوتر سایت: «© سقف من — تمامی حقوق محفوظ است» به‌همراه «طراحی و توسعه: علی چترایی».
- متادیتای هر صفحه شامل `author`, `creator` و `copyright` است.
- فایل‌های `LICENSE`، `NOTICE` و `apps/web/public/humans.txt` مالکیت اثر را ثبت می‌کنند.
- کامپوننت `ContentProtection`: هنگام کپی متن‌های بلند، خط منبع و نام توسعه‌دهنده به
  کلیپ‌بورد اضافه می‌شود؛ کشیدن و منوی راست‌کلیک روی تصاویر غیرفعال است؛ در چاپ صفحه
  نیز نشان حق نشر درج می‌شود.

> شفاف باشیم: هیچ روش سمت‌کلاینتی نمی‌تواند جلوی کپی رابط کاربری را بگیرد — مرورگر
> ناچار است HTML و CSS را دریافت کند. این تدابیر کپی اتفاقی را «بانام» می‌کنند و
> پشتوانه حقوقی (LICENSE و نشان فوتر) را می‌سازند، نه بیشتر.

## استقرار

راهنمای کامل استقرار با Docker، Nginx و GitHub Actions در
[`DEPLOYMENT.md`](./DEPLOYMENT.md) است. خلاصه:

```bash
cp .env.production.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
```

CI روی هر push اجرا می‌شود (`.github/workflows/ci.yml`) و push روی `main`
استقرار خودکار را روی سرور راه می‌اندازد (`.github/workflows/deploy.yml`).
