# استقرار «سقف من» — Docker + Nginx + GitHub Actions

## معماری استقرار

```
اینترنت ──► nginx (80/443)  ──┬─► web  :3000   (Next.js)
                              └─► api  :4000   (NestJS) ──► db :5432 (PostgreSQL)
                                   │
                                   └─ volume: uploads
```

فقط Nginx پورت باز دارد؛ سه سرویس دیگر روی شبکه داخلی `internal` می‌مانند و از
بیرون قابل دسترسی نیستند.

---

## ۱. آماده‌سازی سرور (یک‌بار)

```bash
# Docker و Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # بعد از این یک‌بار logout/login کنید

# کلون پروژه
git clone git@github.com:USERNAME/saghf-man.git
cd saghf-man

# متغیرهای محیطی
cp .env.production.example .env
nano .env        # همه CHANGE_ME ها را عوض کنید
```

کلیدهای امن بسازید:

```bash
openssl rand -base64 48   # برای JWT_SECRET
openssl rand -base64 48   # برای JWT_REFRESH_SECRET
```

---

## ۲. دامنه در کانفیگ Nginx

در `nginx/conf.d/saghf.conf` هر جا `example.com` هست با دامنه خودتان عوض کنید
(چهار جا: دو `server_name` و دو مسیر گواهی).

---

## ۳. گرفتن اولین گواهی SSL

تا وقتی گواهی وجود ندارد، Nginx با کانفیگ HTTPS بالا نمی‌آید. پس اول با کانفیگ
موقت شروع کنید:

```bash
mv nginx/conf.d/saghf.conf nginx/conf.d/saghf.conf.disabled
mv nginx/conf.d/bootstrap.conf.disabled nginx/conf.d/bootstrap.conf
nano nginx/conf.d/bootstrap.conf        # دامنه را اینجا هم عوض کنید

docker compose -f docker-compose.prod.yml up -d --build db api web nginx

docker compose -f docker-compose.prod.yml run --rm certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com -d www.example.com \
  --email you@example.com --agree-tos --no-eff-email

# برگشت به کانفیگ اصلی
rm nginx/conf.d/bootstrap.conf
mv nginx/conf.d/saghf.conf.disabled nginx/conf.d/saghf.conf
docker compose -f docker-compose.prod.yml up -d
```

سرویس `certbot` بعد از این هر ۱۲ ساعت تمدید را امتحان می‌کند.

---

## ۴. داده اولیه (فقط بار اول)

```bash
docker compose -f docker-compose.prod.yml exec api \
  npx prisma db seed --schema apps/api/prisma/schema.prisma
```

بعد با شماره مدیر (`09120000000` در seed) وارد شوید و از
`/admin/settings/contact` شماره‌های واقعی شرکت را ثبت کنید.

> اسکریپت `deploy-docker.sh` عمداً seed اجرا نمی‌کند تا داده‌های واقعی
> بازنویسی نشوند.

---

## ۵. استقرار خودکار از گیت‌هاب

### Secrets لازم

در GitHub → Settings → Secrets and variables → Actions:

| نام | مقدار |
| --- | --- |
| `SSH_HOST` | آی‌پی یا دامنه سرور |
| `SSH_USER` | کاربر SSH |
| `SSH_KEY` | کلید **خصوصی** (کل محتوای فایل، شامل خطوط BEGIN/END) |
| `SSH_PORT` | معمولاً `22` |
| `DEPLOY_PATH` | مسیر کامل ریپو روی سرور، مثل `/home/deploy/saghf-man` |

### کلید SSH

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/saghf_deploy
# public را روی سرور بگذارید:
ssh-copy-id -i ~/.ssh/saghf_deploy.pub user@server
# private را در Secret به نام SSH_KEY بگذارید:
cat ~/.ssh/saghf_deploy
```

### جریان کار

- هر push روی `main` یا `develop` و هر PR → workflow **CI**: نصب، بیلد
  پکیج‌های مشترک، Prisma generate، لینت، typecheck، تست‌ها و بیلد هر دو اپ.
- هر push روی `main` → workflow **Deploy**: اتصال SSH و اجرای
  `scripts/deploy-docker.sh` که pull، build، `migrate deploy` و
  `up -d` را انجام می‌دهد.

می‌توانید Deploy را دستی هم اجرا کنید (Actions → Deploy → Run workflow).

---

## دستورهای روزمره

```bash
C="docker compose -f docker-compose.prod.yml"

$C ps                      # وضعیت سرویس‌ها
$C logs -f api             # لاگ زنده API
$C logs -f web
$C restart nginx           # بعد از تغییر کانفیگ Nginx
$C exec nginx nginx -t     # اعتبارسنجی کانفیگ قبل از restart
$C down                    # توقف همه (داده‌ها در volume می‌مانند)
```

### پشتیبان‌گیری

```bash
# دیتابیس
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U saghf saghf_man | gzip > backup-$(date +%F).sql.gz

# تصاویر آپلودی
docker run --rm -v saghf-man_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

### بازگردانی

```bash
gunzip -c backup-2026-09-01.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T db psql -U saghf saghf_man
```

---

## نکته‌هایی که معمولاً وقت می‌گیرند

**بیلد Next روی VPS کوچک.** روی سرور با کمتر از ۲ گیگ رم، `docker compose build`
ممکن است با OOM بمیرد. یا swap اضافه کنید:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

یا ایمیج‌ها را در GitHub Actions بیلد کنید و سرور فقط `pull` کند.

**تغییر `NEXT_PUBLIC_*` نیاز به بیلد مجدد دارد.** این مقادیر داخل باندل مرورگر
نوشته می‌شوند، پس تغییرشان در `.env` بدون `--build` اثری ندارد:

```bash
docker compose -f docker-compose.prod.yml up -d --build web
```

**فایل `.env` هرگز در گیت نرود.** در `.gitignore` هست؛ اگر قبلاً commit شده،
با `git rm --cached .env` خارجش کنید و کلیدها را عوض کنید.

**تصاویر آپلودی در volume می‌مانند**، پس `git reset --hard` در اسکریپت استقرار
به آن‌ها کاری ندارد.
