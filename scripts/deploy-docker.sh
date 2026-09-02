#!/usr/bin/env bash
#
# استقرار «سقف من» با Docker Compose.
# از GitHub Actions (workflow deploy) یا دستی روی سرور اجرا می‌شود.
#
# پیش‌نیاز روی سرور: git، Docker، Docker Compose v2 و یک فایل .env کنار ریپو.

set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"
BRANCH="${DEPLOY_BRANCH:-main}"

if [ ! -f .env ]; then
  echo "✖ فایل .env پیدا نشد. از .env.production.example یک نسخه بسازید." >&2
  exit 1
fi

echo "▶ کشیدن آخرین تغییرات از شاخه ${BRANCH}"
git fetch --all --prune
git reset --hard "origin/${BRANCH}"

echo "▶ بیلد ایمیج‌ها"
$COMPOSE build

echo "▶ اجرای مایگریشن‌های دیتابیس"
# اگر مایگریشن شکست بخورد، سرویس قدیمی دست‌نخورده بالا می‌ماند.
$COMPOSE up -d db
$COMPOSE run --rm api npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

echo "▶ بالا آوردن سرویس‌ها"
$COMPOSE up -d --remove-orphans

echo "▶ پاک‌سازی ایمیج‌های بلااستفاده"
docker image prune -f

$COMPOSE ps
echo "✅ استقرار کامل شد."
