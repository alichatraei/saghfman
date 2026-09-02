import { Injectable } from '@nestjs/common';
import { AmenityDto, CityDto, NeighborhoodDto, PropertyTypeDto, TransactionTypeDto, TransactionKind } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  async propertyTypes(): Promise<PropertyTypeDto[]> {
    const rows = await this.prisma.propertyType.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      icon: row.icon,
      landOnly: row.landOnly,
      order: row.order,
    }));
  }

  async transactionTypes(): Promise<TransactionTypeDto[]> {
    const rows = await this.prisma.transactionType.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      kind: row.kind as TransactionKind,
      order: row.order,
    }));
  }

  async neighborhoods(query?: string, city?: string): Promise<NeighborhoodDto[]> {
    const rows = await this.prisma.neighborhood.findMany({
      where: {
        isActive: true,
        ...(city ? { city } : {}),
        ...(query ? { title: { contains: query, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ city: 'asc' }, { title: 'asc' }],
      take: 200,
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      city: row.city,
      province: row.province,
    }));
  }

  /** Distinct cities that currently have neighbourhoods, for the city select. */
  async cities(): Promise<CityDto[]> {
    const rows = await this.prisma.neighborhood.groupBy({
      by: ['city', 'province'],
      where: { isActive: true },
      _count: { _all: true },
      orderBy: { city: 'asc' },
    });
    return rows.map((row) => ({
      city: row.city,
      province: row.province,
      neighborhoodCount: row._count._all,
    }));
  }

  async amenities(): Promise<AmenityDto[]> {
    const rows = await this.prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => ({ id: row.id, slug: row.slug, title: row.title, icon: row.icon }));
  }
}
