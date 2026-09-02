export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  otp: {
    length: number;
    ttlSeconds: number;
    maxAttempts: number;
    resendCooldownSeconds: number;
  };
  uploads: {
    path: string;
    maxImagesPerProperty: number;
    maxImageSizeBytes: number;
  };
  company: {
    name: string;
    phone: string;
    secondaryPhone: string;
    whatsapp: string;
    workingHours: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    sender: string;
    template: string;
  };
  cookieDomain: string;
}

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const appConfig = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-access-secret-change-me-please-32chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me-32chars',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },
  otp: {
    length: int(process.env.OTP_LENGTH, 5),
    ttlSeconds: int(process.env.OTP_TTL_SECONDS, 120),
    maxAttempts: int(process.env.OTP_MAX_ATTEMPTS, 5),
    resendCooldownSeconds: int(process.env.OTP_RESEND_COOLDOWN_SECONDS, 60),
  },
  uploads: {
    path: process.env.UPLOAD_PATH ?? './uploads',
    maxImagesPerProperty: int(process.env.MAX_IMAGES_PER_PROPERTY, 15),
    maxImageSizeBytes: int(process.env.MAX_IMAGE_SIZE_MB, 8) * 1024 * 1024,
  },
  company: {
    name: process.env.COMPANY_NAME ?? 'سقف من',
    phone: process.env.COMPANY_DEFAULT_PHONE ?? '021-91001234',
    secondaryPhone: process.env.COMPANY_SECONDARY_PHONE ?? '',
    whatsapp: process.env.COMPANY_WHATSAPP ?? '',
    workingHours: process.env.COMPANY_WORKING_HOURS ?? 'همه‌روزه از ۹ صبح تا ۹ شب',
  },
  sms: {
    provider: process.env.SMS_PROVIDER ?? 'mock',
    apiKey: process.env.SMS_API_KEY ?? '',
    sender: process.env.SMS_SENDER ?? '',
    template: process.env.SMS_TEMPLATE ?? 'saghfman-otp',
  },
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
});
