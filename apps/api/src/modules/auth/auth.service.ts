import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { OtpPurpose, User, UserStatus } from '@prisma/client';
import { AuthTokensDto, AuthUserDto, RequestOtpResponse } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SMS_PROVIDER, SmsProvider } from './sms/sms-provider.interface';
import { normalizeIranMobile } from '../../common/utils/phone.util';
import { generateNumericCode, sha256 } from '../../common/utils/hash.util';

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
  ) {}

  /* ------------------------------ OTP ------------------------------ */

  async requestOtp(rawPhone: string, meta: RequestMeta): Promise<RequestOtpResponse> {
    const phone = this.requirePhone(rawPhone);
    const ttl = this.config.get<number>('otp.ttlSeconds') ?? 120;
    const cooldown = this.config.get<number>('otp.resendCooldownSeconds') ?? 60;
    const length = this.config.get<number>('otp.length') ?? 5;

    const recent = await this.prisma.otpCode.findFirst({
      where: { phone, purpose: OtpPurpose.LOGIN, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      const elapsed = (Date.now() - recent.createdAt.getTime()) / 1000;
      if (elapsed < cooldown) {
        throw new BadRequestException(
          `برای دریافت کد جدید ${Math.ceil(cooldown - elapsed)} ثانیه صبر کنید.`,
        );
      }
    }

    const blocked = await this.prisma.user.findFirst({
      where: { phone, status: UserStatus.BLOCKED },
      select: { id: true },
    });
    if (blocked) throw new UnauthorizedException('حساب کاربری شما مسدود شده است.');

    const code = generateNumericCode(length);
    await this.prisma.otpCode.create({
      data: {
        phone,
        codeHash: sha256(code),
        purpose: OtpPurpose.LOGIN,
        expiresAt: new Date(Date.now() + ttl * 1000),
        ip: meta.ip,
        userAgent: meta.userAgent?.slice(0, 250),
      },
    });

    const result = await this.sms.send({
      to: phone,
      text: `کد ورود شما به سقف من: ${code}`,
      tokens: { code },
    });
    if (!result.success) {
      this.logger.error(`SMS delivery failed via ${this.sms.name}: ${result.error}`);
      throw new BadRequestException('ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    }

    return {
      expiresInSeconds: ttl,
      resendAfterSeconds: cooldown,
      ...(this.sms.exposesCode ? { devCode: code } : {}),
    };
  }

  async verifyOtp(
    rawPhone: string,
    code: string,
    meta: RequestMeta,
  ): Promise<{ tokens: AuthTokensDto; refreshToken: string }> {
    const phone = this.requirePhone(rawPhone);
    const maxAttempts = this.config.get<number>('otp.maxAttempts') ?? 5;

    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, purpose: OtpPurpose.LOGIN, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new BadRequestException('کدی برای این شماره ارسال نشده است.');
    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('کد منقضی شده است. دوباره درخواست دهید.');
    }
    if (otp.attempts >= maxAttempts) {
      throw new BadRequestException('تعداد تلاش‌ها بیش از حد مجاز است. کد جدید بگیرید.');
    }
    if (otp.codeHash !== sha256(code)) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('کد وارد شده صحیح نیست.');
    }

    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone, lastLoginAt: new Date() },
      update: { lastLoginAt: new Date(), deletedAt: null },
    });
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('حساب کاربری شما مسدود شده است.');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date(), userId: user.id },
    });

    return this.issueTokens(user, meta);
  }

  /* ---------------------------- Tokens ----------------------------- */

  async issueTokens(
    user: User,
    meta: RequestMeta,
  ): Promise<{ tokens: AuthTokensDto; refreshToken: string }> {
    const accessTtl = this.config.get<string>('jwt.accessTtl') ?? '15m';
    const refreshTtl = this.config.get<string>('jwt.refreshTtl') ?? '30d';

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, phone: user.phone, role: user.role },
      { secret: this.config.get<string>('jwt.secret'), expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      { secret: this.config.get<string>('jwt.refreshSecret'), expiresIn: refreshTtl },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken),
        userAgent: meta.userAgent?.slice(0, 250),
        ip: meta.ip,
        expiresAt: new Date(Date.now() + this.ttlToMs(refreshTtl)),
      },
    });

    return {
      tokens: { accessToken, expiresIn: this.ttlToMs(accessTtl) / 1000, user: this.toAuthUser(user) },
      refreshToken,
    };
  }

  async refresh(
    token: string | undefined,
    meta: RequestMeta,
  ): Promise<{ tokens: AuthTokensDto; refreshToken: string }> {
    if (!token) throw new UnauthorizedException('نشست شما منقضی شده است. دوباره وارد شوید.');

    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('نشست شما منقضی شده است. دوباره وارد شوید.');
    }

    const candidates = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let matched: (typeof candidates)[number] | undefined;
    for (const candidate of candidates) {
      if (await argon2.verify(candidate.tokenHash, token)) {
        matched = candidate;
        break;
      }
    }
    if (!matched) throw new UnauthorizedException('نشست شما معتبر نیست. دوباره وارد شوید.');

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findFirst({ where: { id: payload.sub, deletedAt: null } });
    if (!user) throw new UnauthorizedException('حساب کاربری یافت نشد.');
    return this.issueTokens(user, meta);
  }

  async logout(token: string | undefined, userId?: string): Promise<void> {
    if (userId) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }
    if (!token) return;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* Already invalid — nothing to revoke. */
    }
  }

  /* ---------------------------- Helpers ---------------------------- */

  toAuthUser(user: User & { preferredTransactionId?: string | null }): AuthUserDto {
    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role as AuthUserDto['role'],
      city: user.city,
      preferredTransaction: user.preferredTransactionId ?? null,
      notifyBySms: user.notifyBySms,
      notifyByEmail: user.notifyByEmail,
      notifyOnMatch: user.notifyOnMatch,
      hidePhoneFromListings: user.hidePhoneFromListings,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private requirePhone(raw: string): string {
    const phone = normalizeIranMobile(raw);
    if (!phone) throw new BadRequestException('شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹');
    return phone;
  }

  private ttlToMs(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) return 15 * 60 * 1000;
    const value = Number(match[1]);
    const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]] ?? 60_000;
    return value * unit;
  }
}
