import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Banner, Prisma } from '@prisma/client';
import { AdminBannerDto, BannerDto, BannerVariant } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Banners visible right now: active, and inside their scheduling window.
   * A null date means «no bound», so an always-on banner needs no dates.
   */
  async findActive(position = 'home-top'): Promise<BannerDto[]> {
    const now = new Date();
    const rows = await this.prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    });
    return rows.map(toBanner);
  }

  async findAll(position?: string): Promise<AdminBannerDto[]> {
    const rows = await this.prisma.banner.findMany({
      where: position ? { position } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map(toAdminBanner);
  }

  async findOne(id: string): Promise<AdminBannerDto> {
    const row = await this.prisma.banner.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('بنر یافت نشد.');
    return toAdminBanner(row);
  }

  async create(dto: CreateBannerDto): Promise<AdminBannerDto> {
    const data = this.toData(dto) as Prisma.BannerCreateInput;
    const row = await this.prisma.banner.create({
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.position !== undefined ? { position: dto.position.trim() || 'home-top' } : { position: 'home-top' }),
        ...data,
      },
    });
    return toAdminBanner(row);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<AdminBannerDto> {
    await this.findOne(id);
    const data: Prisma.BannerUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.position !== undefined ? { position: dto.position.trim() || 'home-top' } : {}),
      ...this.toData(dto),
    };
    const row = await this.prisma.banner.update({
      where: { id },
      data,
    });
    return toAdminBanner(row);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.banner.delete({ where: { id } });
  }

  /** Shared field mapping plus the start/end sanity check. */
  private toData(dto: UpdateBannerDto): Prisma.BannerUpdateInput {
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : dto.startsAt === '' ? null : undefined;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : dto.endsAt === '' ? null : undefined;

    if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
      throw new BadRequestException('تاریخ پایان نمایش نمی‌تواند قبل از تاریخ شروع باشد.');
    }

    return {
      ...(dto.message !== undefined ? { message: dto.message.trim() || null } : {}),
      ...(dto.variant !== undefined ? { variant: dto.variant } : {}),
      ...(dto.ctaLabel !== undefined ? { ctaLabel: dto.ctaLabel.trim() || null } : {}),
      ...(dto.linkUrl !== undefined ? { linkUrl: dto.linkUrl.trim() || null } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl.trim() || null } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.dismissible !== undefined ? { dismissible: dto.dismissible } : {}),
      ...(dto.order !== undefined ? { order: dto.order } : {}),
      ...(startsAt !== undefined ? { startsAt } : {}),
      ...(endsAt !== undefined ? { endsAt } : {}),
    };
  }
}

function toBanner(row: Banner): BannerDto {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    variant: (row.variant as BannerVariant) ?? 'info',
    ctaLabel: row.ctaLabel,
    linkUrl: row.linkUrl,
    imageUrl: row.imageUrl,
    dismissible: row.dismissible,
  };
}

function toAdminBanner(row: Banner): AdminBannerDto {
  const now = Date.now();
  const started = !row.startsAt || row.startsAt.getTime() <= now;
  const notEnded = !row.endsAt || row.endsAt.getTime() >= now;

  return {
    ...toBanner(row),
    position: row.position,
    isActive: row.isActive,
    order: row.order,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    isLive: row.isActive && started && notEnded,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
