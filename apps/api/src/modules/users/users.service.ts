import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { AuthUserDto, NotificationDto } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new NotFoundException('حساب کاربری یافت نشد.');
    return this.toDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUserDto> {
    let preferredTransactionId: string | null | undefined;
    if (dto.preferredTransaction !== undefined) {
      if (!dto.preferredTransaction) {
        preferredTransactionId = null;
      } else {
        const transaction = await this.prisma.transactionType.findUnique({
          where: { slug: dto.preferredTransaction },
          select: { id: true },
        });
        if (!transaction) throw new BadRequestException('نوع معامله انتخاب‌شده معتبر نیست.');
        preferredTransactionId = transaction.id;
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        city: dto.city,
        preferredAreas: dto.preferredAreas,
        notifyBySms: dto.notifyBySms,
        notifyByEmail: dto.notifyByEmail,
        notifyOnMatch: dto.notifyOnMatch,
        hidePhoneFromListings: dto.hidePhoneFromListings,
        ...(preferredTransactionId !== undefined ? { preferredTransactionId } : {}),
      },
    });
    return this.toDto(user);
  }

  async listNotifications(userId: string): Promise<NotificationDto[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((row) => ({
      id: row.id,
      type: row.type as NotificationDto['type'],
      title: row.title,
      body: row.body,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    linkUrl?: string,
  ): Promise<void> {
    await this.prisma.notification.create({ data: { userId, type, title, body, linkUrl } });
  }

  private toDto(user: {
    id: string;
    phone: string;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
    city: string | null;
    preferredTransactionId: string | null;
    notifyBySms: boolean;
    notifyByEmail: boolean;
    notifyOnMatch: boolean;
    hidePhoneFromListings: boolean;
    createdAt: Date;
  }): AuthUserDto {
    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role as AuthUserDto['role'],
      city: user.city,
      preferredTransaction: user.preferredTransactionId,
      notifyBySms: user.notifyBySms,
      notifyByEmail: user.notifyByEmail,
      notifyOnMatch: user.notifyOnMatch,
      hidePhoneFromListings: user.hidePhoneFromListings,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
