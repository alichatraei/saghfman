# syntax=docker/dockerfile:1

# ---------- deps: نصب کامل (شامل devDependencies برای بیلد) ----------
FROM node:20-alpine AS deps
WORKDIR /repo
# vips برای sharp، بقیه برای کامپایل ماژول‌های native (argon2)
RUN apk add --no-cache python3 make g++ vips-dev openssl
COPY package.json package-lock.json* ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    else npm install --no-audit --no-fund; fi

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /repo
RUN apk add --no-cache vips-dev openssl
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
# تولید Prisma Client پیش از کامپایل TypeScript (تایپ‌ها از همین‌جا می‌آیند)
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
RUN npm run build -w @saghf/types \
 && npm run build -w @saghf/config \
 && npm run build -w @saghf/api

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
RUN apk add --no-cache vips openssl \
 && addgroup -S app && adduser -S app -G app

COPY package.json package-lock.json* ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; \
    else npm install --omit=dev --no-audit --no-fund; fi

# Prisma Client تولیدشده (خودِ کلاینت + موتور کوئری)
COPY --from=builder /repo/node_modules/.prisma        ./node_modules/.prisma
COPY --from=builder /repo/node_modules/@prisma/client ./node_modules/@prisma/client

# خروجی بیلد
COPY --from=builder /repo/packages/types/dist   ./packages/types/dist
COPY --from=builder /repo/packages/config/dist  ./packages/config/dist
COPY --from=builder /repo/apps/api/dist         ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma       ./apps/api/prisma

# محل ذخیرهٔ تصاویر آپلودی (والیوم در docker-compose به همین مسیر وصل می‌شود)
RUN mkdir -p /repo/uploads && chown -R app:app /repo/uploads
ENV UPLOAD_PATH=./uploads

USER app
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]