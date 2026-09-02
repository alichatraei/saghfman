import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Housekeeping jobs. Kept intentionally small and idempotent so a restart or a
 * double run can never corrupt data.
 */
@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger('Maintenance');

  constructor(private readonly prisma: PrismaService) {}

  /** Published listings whose 30-day window has passed become EXPIRED. */
  @Cron(CronExpression.EVERY_HOUR)
  async expireOutdatedProperties(): Promise<void> {
    const due = await this.prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        deletedAt: null,
        expiresAt: { lt: new Date() },
      },
      select: { id: true, title: true, ownerId: true },
      take: 200,
    });
    if (due.length === 0) return;

    for (const property of due) {
      await this.prisma.$transaction([
        this.prisma.property.update({
          where: { id: property.id },
          data: { status: PropertyStatus.EXPIRED },
        }),
        this.prisma.propertyStatusHistory.create({
          data: {
            propertyId: property.id,
            fromStatus: PropertyStatus.PUBLISHED,
            toStatus: PropertyStatus.EXPIRED,
            reason: 'پایان مهلت انتشار',
          },
        }),
        this.prisma.notification.create({
          data: {
            userId: property.ownerId,
            type: NotificationType.PROPERTY_EXPIRED,
            title: 'مهلت آگهی شما به پایان رسید',
            body: `آگهی «${property.title}» منقضی شد. برای انتشار دوباره، آن را تمدید کنید.`,
            linkUrl: '/account/listings',
          },
        }),
      ]);
    }

    this.logger.log(`${due.length} listing(s) expired.`);
  }

  /** Consumed or expired OTP rows are useless after a day. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeOtpCodes(): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
    const { count } = await this.prisma.otpCode.deleteMany({
      where: { OR: [{ expiresAt: { lt: cutoff } }, { consumedAt: { lt: cutoff } }] },
    });
    if (count > 0) this.logger.log(`${count} OTP row(s) purged.`);
  }

  /** Revoked or expired refresh tokens are dropped after 7 days. */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async purgeRefreshTokens(): Promise<void> {
    const cutoff = new Date(Date.now() - 7 * 86_400_000);
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }] },
    });
    if (count > 0) this.logger.log(`${count} refresh token(s) purged.`);
  }

  /** Raw view rows older than 90 days; aggregated counters stay on Property. */
  @Cron(CronExpression.EVERY_WEEK)
  async purgeOldViews(): Promise<void> {
    const cutoff = new Date(Date.now() - 90 * 86_400_000);
    const { count } = await this.prisma.propertyView.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) this.logger.log(`${count} view row(s) purged.`);
  }
}
