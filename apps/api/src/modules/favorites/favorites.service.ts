import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '@prisma/client';
import { PropertyCardDto } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { publicPropertySelect, toPropertyCard } from '../properties/property.serializer';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<PropertyCardDto[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId, property: { deletedAt: null } },
      orderBy: { createdAt: 'desc' },
      select: { property: { select: publicPropertySelect } },
    });
    return rows.map((row) => toPropertyCard(row.property));
  }

  async ids(userId: string): Promise<string[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      select: { propertyId: true },
    });
    return rows.map((row) => row.propertyId);
  }

  async add(userId: string, propertyId: string): Promise<{ favorited: true }> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null, status: PropertyStatus.PUBLISHED },
      select: { id: true },
    });
    if (!property) throw new NotFoundException('آگهی یافت نشد.');

    await this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      create: { userId, propertyId },
      update: {},
    });
    return { favorited: true };
  }

  async remove(userId: string, propertyId: string): Promise<{ favorited: false }> {
    await this.prisma.favorite.deleteMany({ where: { userId, propertyId } });
    return { favorited: false };
  }
}
