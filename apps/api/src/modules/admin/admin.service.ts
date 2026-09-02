import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma, PropertyStatus, UserStatus } from '@prisma/client';
import { AdminDashboardDto, AdminPropertyDto, AdminUserDto, Paginated } from '@saghf/types';
import { PROPERTY_LIMITS } from '@saghf/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { adminPropertySelect, toAdminProperty } from '../properties/property.serializer';
import { paginate } from '../../common/utils/pagination.util';
import { AdminPropertyQueryDto, AdminUserQueryDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  /* ---------------------------- Dashboard ---------------------------- */

  async dashboard(): Promise<AdminDashboardDto> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

    const [users, published, pending, rejected, today, favorites, views, recentPending] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.property.count({ where: { status: PropertyStatus.PUBLISHED, deletedAt: null } }),
        this.prisma.property.count({ where: { status: PropertyStatus.PENDING, deletedAt: null } }),
        this.prisma.property.count({ where: { status: PropertyStatus.REJECTED, deletedAt: null } }),
        this.prisma.property.count({ where: { createdAt: { gte: startOfToday }, deletedAt: null } }),
        this.prisma.favorite.count(),
        this.prisma.propertyView.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
        this.prisma.property.findMany({
          where: { status: PropertyStatus.PENDING, deletedAt: null },
          select: adminPropertySelect,
          orderBy: { createdAt: 'asc' },
          take: 8,
        }),
      ]);

    const buckets = new Map<string, number>();
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(Date.now() - index * 86_400_000).toISOString().slice(0, 10);
      buckets.set(date, 0);
    }
    for (const view of views) {
      const key = view.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      users,
      publishedProperties: published,
      pendingProperties: pending,
      rejectedProperties: rejected,
      propertiesToday: today,
      favorites,
      viewsLast7Days: [...buckets.entries()].map(([date, count]) => ({ date, count })),
      recentPending: recentPending.map(toAdminProperty),
    };
  }

  /* ---------------------------- Properties --------------------------- */

  async listProperties(query: AdminPropertyQueryDto): Promise<Paginated<AdminPropertyDto>> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, PROPERTY_LIMITS.maxPageSize);

    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { code: { contains: query.q } },
              { owner: { phone: { contains: query.q } } },
              { owner: { fullName: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        select: adminPropertySelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.property.count({ where }),
    ]);

    return paginate(rows.map(toAdminProperty), total, page, pageSize);
  }

  async getProperty(id: string): Promise<AdminPropertyDto> {
    const row = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: adminPropertySelect,
    });
    if (!row) throw new NotFoundException('آگهی یافت نشد.');
    return toAdminProperty(row);
  }

  async approve(id: string, actorId: string): Promise<AdminPropertyDto> {
    const property = await this.requireProperty(id);
    const expiresAt = new Date(Date.now() + PROPERTY_LIMITS.publishDurationDays * 86_400_000);

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        status: PropertyStatus.PUBLISHED,
        rejectionReason: null,
        publishedAt: property.publishedAt ?? new Date(),
        expiresAt,
      },
      select: adminPropertySelect,
    });

    await this.recordStatus(id, property.status, PropertyStatus.PUBLISHED, actorId);
    await this.audit(actorId, 'property.approve', 'Property', id);
    await this.users.notify(
      property.ownerId,
      NotificationType.PROPERTY_APPROVED,
      'آگهی شما منتشر شد',
      `آگهی «${property.title}» تأیید و منتشر شد.`,
      `/properties/${updated.slug}`,
    );
    return toAdminProperty(updated);
  }

  async reject(id: string, reason: string, actorId: string): Promise<AdminPropertyDto> {
    if (!reason?.trim()) throw new BadRequestException('برای رد آگهی، ذکر دلیل الزامی است.');
    const property = await this.requireProperty(id);

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.REJECTED, rejectionReason: reason.trim() },
      select: adminPropertySelect,
    });

    await this.recordStatus(id, property.status, PropertyStatus.REJECTED, actorId, reason);
    await this.audit(actorId, 'property.reject', 'Property', id, { reason });
    await this.users.notify(
      property.ownerId,
      NotificationType.PROPERTY_REJECTED,
      'آگهی شما رد شد',
      `آگهی «${property.title}» رد شد. دلیل: ${reason.trim()}`,
      '/account/listings',
    );
    return toAdminProperty(updated);
  }

  async feature(id: string, featured: boolean, actorId: string): Promise<AdminPropertyDto> {
    await this.requireProperty(id);
    const updated = await this.prisma.property.update({
      where: { id },
      data: { isFeatured: featured },
      select: adminPropertySelect,
    });
    await this.audit(actorId, featured ? 'property.feature' : 'property.unfeature', 'Property', id);
    return toAdminProperty(updated);
  }

  async expire(id: string, actorId: string): Promise<AdminPropertyDto> {
    const property = await this.requireProperty(id);
    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.EXPIRED },
      select: adminPropertySelect,
    });
    await this.recordStatus(id, property.status, PropertyStatus.EXPIRED, actorId);
    await this.audit(actorId, 'property.expire', 'Property', id);
    return toAdminProperty(updated);
  }

  async deleteProperty(id: string, actorId: string): Promise<void> {
    await this.requireProperty(id);
    await this.prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit(actorId, 'property.delete', 'Property', id);
  }

  /* ------------------------------ Users ------------------------------ */

  async listUsers(query: AdminUserQueryDto): Promise<Paginated<AdminUserDto>> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { phone: { contains: query.q } },
              { fullName: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { properties: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items: AdminUserDto[] = rows.map((row) => ({
      id: row.id,
      phone: row.phone,
      fullName: row.fullName,
      role: row.role as AdminUserDto['role'],
      status: row.status as AdminUserDto['status'],
      propertyCount: row._count.properties,
      createdAt: row.createdAt.toISOString(),
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    }));

    return paginate(items, total, page, pageSize);
  }

  async setUserStatus(id: string, status: UserStatus, actorId: string): Promise<AdminUserDto> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { properties: true } },
      },
    });
    if (status !== UserStatus.ACTIVE) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.audit(actorId, `user.${status.toLowerCase()}`, 'User', id);

    return {
      id: updated.id,
      phone: updated.phone,
      fullName: updated.fullName,
      role: updated.role as AdminUserDto['role'],
      status: updated.status as AdminUserDto['status'],
      propertyCount: updated._count.properties,
      createdAt: updated.createdAt.toISOString(),
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
    };
  }

  /* ----------------------------- Helpers ----------------------------- */

  private async requireProperty(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true, title: true, publishedAt: true },
    });
    if (!property) throw new NotFoundException('آگهی یافت نشد.');
    return property;
  }

  private async recordStatus(
    propertyId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    changedById: string,
    reason?: string,
  ): Promise<void> {
    await this.prisma.propertyStatusHistory.create({
      data: { propertyId, fromStatus, toStatus, changedById, reason },
    });
  }

  private async audit(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.adminAuditLog.create({
      data: { actorId, action, entityType, entityId, metadata },
    });
  }
}
