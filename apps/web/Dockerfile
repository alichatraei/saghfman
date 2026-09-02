# syntax=docker/dockerfile:1

# ---------- deps: نصب کامل (شامل devDependencies برای بیلد) ----------
FROM node:20-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY apps/web/package.json apps/web/
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    else npm install --no-audit --no-fund; fi

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1

# Next مقادیر NEXT_PUBLIC_ را در همین مرحله داخل باندل مرورگر می‌نویسد،
# پس باید build-arg باشند؛ متغیر محیطیِ زمان اجرا دیر می‌رسد.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME

COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build -w @saghf/types \
 && npm run build -w @saghf/config \
 && npm run build -w @saghf/web

# ---------- runner: فقط وابستگی‌های production ----------
FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app

COPY package.json package-lock.json* ./
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY apps/web/package.json apps/web/
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; \
    else npm install --omit=dev --no-audit --no-fund; fi

# خروجی بیلدشدهٔ پکیج‌های مشترک و اپ وب
COPY --from=builder /repo/packages/types/dist   ./packages/types/dist
COPY --from=builder /repo/packages/config/dist  ./packages/config/dist
COPY --from=builder /repo/apps/web/.next        ./apps/web/.next
COPY --from=builder /repo/apps/web/public       ./apps/web/public
COPY --from=builder /repo/apps/web/next.config.mjs ./apps/web/next.config.mjs

USER app
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@saghf/web"]