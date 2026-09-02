import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PropertyStatus, TransactionKind, UserRole } from '@prisma/client';
import {
  MyPropertyDetailDto,
  MyPropertyDto,
  Paginated,
  PropertyCardDto,
  PropertyDetailDto,
} from '@saghf/types';
import { PROPERTY_LIMITS } from '@saghf/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';
import {
  myPropertyDetailSelect,
  myPropertySelect,
  toMyPropertyDetail,
  publicPropertySelect,
  toMyProperty,
  toPropertyCard,
  toPropertyDetail,
} from './property.serializer';
import { buildPropertySlug, generatePropertyCode } from '../../common/utils/slug.util';
import { paginate } from '../../common/utils/pagination.util';
import { visitorFingerprint } from '../../common/utils/hash.util';

const RENTAL_KINDS: TransactionKind[] = [
  TransactionKind.RENT,
  TransactionKind.FULL_MORTGAGE,
  TransactionKind.MORTGAGE_RENT,
];

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  /* ------------------------------ Public ----------------------------- */

  async findPublic(query: QueryPropertyDto): Promise<Paginated<PropertyCardDto>> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? PROPERTY_LIMITS.defaultPageSize, PROPERTY_LIMITS.maxPageSize);
    const where = this.buildWhere(query);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        select: publicPropertySelect,
        orderBy: this.buildOrder(query.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.property.count({ where }),
    ]);

    return paginate(rows.map(toPropertyCard), total, page, pageSize);
  }

  async findFeatured(limit = 8): Promise<PropertyCardDto[]> {
    const rows = await this.prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED, deletedAt: null, isFeatured: true },
      select: publicPropertySelect,
      orderBy: [{ publishedAt: 'desc' }],
      take: limit,
    });
    return rows.map(toPropertyCard);
  }

  async findBySlug(slug: string, meta: { ip?: string; userAgent?: string }): Promise<PropertyDetailDto> {
    const row = await this.prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED, deletedAt: null },
      select: publicPropertySelect,
    });
    if (!row) throw new NotFoundException('آگهی مورد نظر یافت نشد یا منتشر نشده است.');

    await this.trackView(row.id, meta);
    const contact = await this.settings.getCompanyContact();
    return toPropertyDetail(row, contact);
  }

  async findSimilar(slug: string, limit = 4): Promise<PropertyCardDto[]> {
    const base = await this.prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED, deletedAt: null },
      select: { id: true, neighborhoodId: true, propertyTypeId: true, transactionTypeId: true },
    });
    if (!base) return [];

    const rows = await this.prisma.property.findMany({
      where: {
        id: { not: base.id },
        status: PropertyStatus.PUBLISHED,
        deletedAt: null,
        transactionTypeId: base.transactionTypeId,
        OR: [{ neighborhoodId: base.neighborhoodId }, { propertyTypeId: base.propertyTypeId }],
      },
      select: publicPropertySelect,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    });
    return rows.map(toPropertyCard);
  }

  /** Slugs of every published property — used by the dynamic sitemap. */
  async findAllPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    });
  }

  /* ------------------------------ Owner ------------------------------ */

  async listMine(userId: string, status?: PropertyStatus): Promise<MyPropertyDto[]> {
    const rows = await this.prisma.property.findMany({
      where: { ownerId: userId, deletedAt: null, ...(status ? { status } : {}) },
      select: myPropertySelect,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toMyProperty);
  }

  async getMineById(userId: string, id: string): Promise<MyPropertyDetailDto> {
    const row = await this.prisma.property.findFirst({
      where: { id, ownerId: userId, deletedAt: null },
      select: myPropertyDetailSelect,
    });
    if (!row) throw new NotFoundException('آگهی یافت نشد.');
    return toMyPropertyDetail(row);
  }

  async create(userId: string, dto: CreatePropertyDto): Promise<MyPropertyDto> {
    const refs = await this.resolveReferences(dto.propertyType, dto.transaction, dto.neighborhood);
    this.validatePricing(refs.transaction.kind, dto);

    const code = await this.uniqueCode();
    const slug = buildPropertySlug({
      typeSlug: refs.propertyType.slug,
      area: dto.area,
      neighborhoodSlug: refs.neighborhood.slug,
      code,
    });

    const amenityIds = await this.resolveAmenities(dto.amenities);
    const status = dto.asDraft ? PropertyStatus.DRAFT : PropertyStatus.PENDING;
    const images = this.normalizeImages(dto.images ?? []);

    const created = await this.prisma.property.create({
      data: {
        slug,
        code,
        title: dto.title.trim(),
        description: dto.description.trim(),
        ownerId: userId,
        propertyTypeId: refs.propertyType.id,
        transactionTypeId: refs.transaction.id,
        neighborhoodId: refs.neighborhood.id,
        address: dto.address.trim(),
        displayAddress: dto.displayAddress?.trim() || null,
        showExactLocation: dto.showExactLocation ?? false,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        area: dto.area,
        hallArea: dto.hallArea ?? null,
        landArea: dto.landArea ?? null,
        rooms: dto.rooms,
        bathrooms: dto.bathrooms ?? null,
        floor: dto.floor ?? null,
        totalFloors: dto.totalFloors ?? null,
        constructionYear: dto.constructionYear ?? null,
        parkingCount: dto.parkingCount ?? 0,
        hasElevator: dto.hasElevator ?? false,
        hasStorage: dto.hasStorage ?? false,
        hasBalcony: dto.hasBalcony ?? false,
        deedType: dto.deedType ?? null,
        heating: dto.heating ?? null,
        cooling: dto.cooling ?? null,
        cabinet: dto.cabinet ?? null,
        floorMaterial: dto.floorMaterial ?? null,
        wallMaterial: dto.wallMaterial ?? null,
        price: dto.price ? BigInt(dto.price) : null,
        pricePerMeter: dto.price ? BigInt(Math.round(Number(dto.price) / dto.area)) : null,
        deposit: dto.deposit ? BigInt(dto.deposit) : null,
        monthlyRent: dto.monthlyRent ? BigInt(dto.monthlyRent) : null,
        isNegotiable: dto.isNegotiable ?? false,
        exchangeable: dto.exchangeable ?? false,
        status,
        images: { create: images },
        amenities: { create: amenityIds.map((amenityId) => ({ amenityId })) },
        statusHistory: { create: { toStatus: status, changedById: userId } },
      },
      select: myPropertySelect,
    });

    return toMyProperty(created);
  }

  async update(userId: string, id: string, dto: UpdatePropertyDto, role: UserRole): Promise<MyPropertyDto> {
    const existing = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true, area: true },
    });
    if (!existing) throw new NotFoundException('آگهی یافت نشد.');
    this.assertCanManage(existing.ownerId, userId, role);

    const data: Prisma.PropertyUpdateInput = {};
    if (dto.title) data.title = dto.title.trim();
    if (dto.description) data.description = dto.description.trim();
    if (dto.address) data.address = dto.address.trim();
    if (dto.displayAddress !== undefined) data.displayAddress = dto.displayAddress?.trim() || null;
    if (dto.showExactLocation !== undefined) data.showExactLocation = dto.showExactLocation;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.area !== undefined) data.area = dto.area;
    if (dto.hallArea !== undefined) data.hallArea = dto.hallArea;
    if (dto.landArea !== undefined) data.landArea = dto.landArea;
    if (dto.rooms !== undefined) data.rooms = dto.rooms;
    if (dto.bathrooms !== undefined) data.bathrooms = dto.bathrooms;
    if (dto.floor !== undefined) data.floor = dto.floor;
    if (dto.totalFloors !== undefined) data.totalFloors = dto.totalFloors;
    if (dto.constructionYear !== undefined) data.constructionYear = dto.constructionYear;
    if (dto.parkingCount !== undefined) data.parkingCount = dto.parkingCount;
    if (dto.hasElevator !== undefined) data.hasElevator = dto.hasElevator;
    if (dto.hasStorage !== undefined) data.hasStorage = dto.hasStorage;
    if (dto.hasBalcony !== undefined) data.hasBalcony = dto.hasBalcony;
    if (dto.deedType !== undefined) data.deedType = dto.deedType;
    if (dto.heating !== undefined) data.heating = dto.heating;
    if (dto.cooling !== undefined) data.cooling = dto.cooling;
    if (dto.cabinet !== undefined) data.cabinet = dto.cabinet;
    if (dto.floorMaterial !== undefined) data.floorMaterial = dto.floorMaterial;
    if (dto.wallMaterial !== undefined) data.wallMaterial = dto.wallMaterial;
    if (dto.isNegotiable !== undefined) data.isNegotiable = dto.isNegotiable;
    if (dto.exchangeable !== undefined) data.exchangeable = dto.exchangeable;

    const area = dto.area ?? existing.area;
    if (dto.price !== undefined) {
      data.price = dto.price ? BigInt(dto.price) : null;
      data.pricePerMeter = dto.price ? BigInt(Math.round(Number(dto.price) / area)) : null;
    }
    if (dto.deposit !== undefined) data.deposit = dto.deposit ? BigInt(dto.deposit) : null;
    if (dto.monthlyRent !== undefined) data.monthlyRent = dto.monthlyRent ? BigInt(dto.monthlyRent) : null;

    if (dto.propertyType) {
      const type = await this.prisma.propertyType.findUnique({ where: { slug: dto.propertyType } });
      if (!type) throw new BadRequestException('نوع ملک انتخاب‌شده معتبر نیست.');
      data.propertyType = { connect: { id: type.id } };
    }
    if (dto.transaction) {
      const transaction = await this.prisma.transactionType.findUnique({ where: { slug: dto.transaction } });
      if (!transaction) throw new BadRequestException('نوع آگهی انتخاب‌شده معتبر نیست.');
      data.transactionType = { connect: { id: transaction.id } };
    }
    if (dto.neighborhood) {
      const neighborhood = await this.prisma.neighborhood.findUnique({ where: { slug: dto.neighborhood } });
      if (!neighborhood) throw new BadRequestException('محله انتخاب‌شده معتبر نیست.');
      data.neighborhood = { connect: { id: neighborhood.id } };
    }

    // Any owner edit sends the listing back to moderation.
    const backToReview = role === UserRole.USER && existing.status !== PropertyStatus.DRAFT;
    if (backToReview) {
      data.status = PropertyStatus.PENDING;
      data.rejectionReason = null;
    }

    if (dto.amenities) {
      const amenityIds = await this.resolveAmenities(dto.amenities);
      await this.prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
      data.amenities = { create: amenityIds.map((amenityId) => ({ amenityId })) };
    }

    if (dto.images) {
      await this.prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      data.images = { create: this.normalizeImages(dto.images) };
    }

    const updated = await this.prisma.property.update({ where: { id }, data, select: myPropertySelect });
    if (backToReview) {
      await this.prisma.propertyStatusHistory.create({
        data: { propertyId: id, fromStatus: existing.status, toStatus: PropertyStatus.PENDING, changedById: userId },
      });
    }
    return toMyProperty(updated);
  }

  async remove(userId: string, id: string, role: UserRole): Promise<void> {
    const existing = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException('آگهی یافت نشد.');
    this.assertCanManage(existing.ownerId, userId, role);
    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date(), status: PropertyStatus.INACTIVE },
    });
  }

  async renew(userId: string, id: string, role: UserRole): Promise<MyPropertyDto> {
    const existing = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: { ownerId: true, status: true },
    });
    if (!existing) throw new NotFoundException('آگهی یافت نشد.');
    this.assertCanManage(existing.ownerId, userId, role);

    const days = PROPERTY_LIMITS.publishDurationDays;
    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        status: existing.status === PropertyStatus.EXPIRED ? PropertyStatus.PENDING : existing.status,
        expiresAt: new Date(Date.now() + days * 86_400_000),
      },
      select: myPropertySelect,
    });
    return toMyProperty(updated);
  }

  async setActive(userId: string, id: string, active: boolean, role: UserRole): Promise<MyPropertyDto> {
    const existing = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      select: { ownerId: true, status: true },
    });
    if (!existing) throw new NotFoundException('آگهی یافت نشد.');
    this.assertCanManage(existing.ownerId, userId, role);

    const next = active ? PropertyStatus.PENDING : PropertyStatus.INACTIVE;
    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: next },
      select: myPropertySelect,
    });
    await this.prisma.propertyStatusHistory.create({
      data: { propertyId: id, fromStatus: existing.status, toStatus: next, changedById: userId },
    });
    return toMyProperty(updated);
  }

  /* ----------------------------- Helpers ----------------------------- */

  private assertCanManage(ownerId: string, userId: string, role: UserRole): void {
    const isStaff = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.EDITOR;
    if (ownerId !== userId && !isStaff) {
      throw new ForbiddenException('شما اجازه ویرایش این آگهی را ندارید.');
    }
  }

  private buildWhere(query: QueryPropertyDto): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
      deletedAt: null,
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { neighborhood: { title: { contains: query.q, mode: 'insensitive' } } },
        { neighborhood: { city: { contains: query.q, mode: 'insensitive' } } },
      ];
    }
    if (query.neighborhood) where.neighborhood = { slug: query.neighborhood };
    if (query.city) {
      where.neighborhood = {
        ...(where.neighborhood ?? {}),
        city: query.city,
      } as Prisma.NeighborhoodWhereInput;
    }
    if (query.propertyType) where.propertyType = { slug: query.propertyType };
    if (query.transaction) where.transactionType = { slug: query.transaction };
    else if (query.transactionGroup) {
      // «خرید» و «اجاره» دو جستجوی جداگانه‌اند؛ هر کدام چند نوع معامله را پوشش می‌دهد.
      where.transactionType = {
        kind: {
          in:
            query.transactionGroup === 'rent'
              ? RENTAL_KINDS
              : [TransactionKind.SALE, TransactionKind.PRESALE, TransactionKind.EXCHANGE],
        },
      };
    }
    if (query.featured !== undefined) where.isFeatured = query.featured;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: BigInt(query.minPrice) } : {}),
        ...(query.maxPrice !== undefined ? { lte: BigInt(query.maxPrice) } : {}),
      };
    }
    if (query.minDeposit !== undefined || query.maxDeposit !== undefined) {
      where.deposit = {
        ...(query.minDeposit !== undefined ? { gte: BigInt(query.minDeposit) } : {}),
        ...(query.maxDeposit !== undefined ? { lte: BigInt(query.maxDeposit) } : {}),
      };
    }
    if (query.minArea !== undefined || query.maxArea !== undefined) {
      where.area = {
        ...(query.minArea !== undefined ? { gte: query.minArea } : {}),
        ...(query.maxArea !== undefined ? { lte: query.maxArea } : {}),
      };
    }
    if (query.rooms !== undefined) where.rooms = query.rooms >= 5 ? { gte: 5 } : query.rooms;
    if (query.minYear !== undefined || query.maxYear !== undefined) {
      where.constructionYear = {
        ...(query.minYear !== undefined ? { gte: query.minYear } : {}),
        ...(query.maxYear !== undefined ? { lte: query.maxYear } : {}),
      };
    }
    if (query.parking) where.parkingCount = { gt: 0 };
    if (query.elevator) where.hasElevator = true;
    if (query.storage) where.hasStorage = true;
    if (query.balcony) where.hasBalcony = true;
    if (query.amenities?.length) {
      where.AND = query.amenities.map((slug) => ({
        amenities: { some: { amenity: { slug } } },
      }));
    }
    return where;
  }

  private buildOrder(sort?: string): Prisma.PropertyOrderByWithRelationInput[] {
    switch (sort) {
      case 'price_desc':
        return [{ price: 'desc' }, { publishedAt: 'desc' }];
      case 'price_asc':
        return [{ price: 'asc' }, { publishedAt: 'desc' }];
      case 'area_desc':
        return [{ area: 'desc' }, { publishedAt: 'desc' }];
      default:
        return [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
    }
  }

  private validatePricing(kind: TransactionKind, dto: CreatePropertyDto): void {
    if (RENTAL_KINDS.includes(kind)) {
      if (!dto.deposit && !dto.monthlyRent) {
        throw new BadRequestException('برای آگهی اجاره، ودیعه یا اجاره ماهانه را وارد کنید.');
      }
      return;
    }
    if (kind === TransactionKind.SALE || kind === TransactionKind.PRESALE) {
      if (!dto.price) throw new BadRequestException('برای آگهی فروش، قیمت کل را وارد کنید.');
    }
  }

  private async resolveReferences(typeSlug: string, transactionSlug: string, neighborhoodSlug: string) {
    const [propertyType, transaction, neighborhood] = await Promise.all([
      this.prisma.propertyType.findUnique({ where: { slug: typeSlug } }),
      this.prisma.transactionType.findUnique({ where: { slug: transactionSlug } }),
      this.prisma.neighborhood.findUnique({ where: { slug: neighborhoodSlug } }),
    ]);
    if (!propertyType) throw new BadRequestException('نوع ملک انتخاب‌شده معتبر نیست.');
    if (!transaction) throw new BadRequestException('نوع آگهی انتخاب‌شده معتبر نیست.');
    if (!neighborhood) throw new BadRequestException('محله انتخاب‌شده معتبر نیست.');
    return { propertyType, transaction, neighborhood };
  }

  private async resolveAmenities(slugs?: string[]): Promise<string[]> {
    if (!slugs?.length) return [];
    const rows = await this.prisma.amenity.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  private normalizeImages(
    images: { url: string; isCover?: boolean; order?: number; alt?: string; width?: number; height?: number }[],
  ) {
    const max = this.config.get<number>('uploads.maxImagesPerProperty') ?? PROPERTY_LIMITS.maxImages;
    const limited = images.slice(0, max);
    const hasCover = limited.some((image) => image.isCover);
    return limited.map((image, index) => ({
      url: image.url,
      alt: image.alt ?? null,
      width: image.width ?? null,
      height: image.height ?? null,
      order: image.order ?? index,
      isCover: image.isCover ?? (!hasCover && index === 0),
    }));
  }

  private async uniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = generatePropertyCode();
      const exists = await this.prisma.property.findUnique({ where: { code }, select: { id: true } });
      if (!exists) return code;
    }
    return String(Date.now()).slice(-6);
  }

  private async trackView(propertyId: string, meta: { ip?: string; userAgent?: string }): Promise<void> {
    const key = visitorFingerprint(meta.ip ?? 'unknown', meta.userAgent ?? 'unknown');
    const since = new Date(Date.now() - 6 * 3600 * 1000);
    const seen = await this.prisma.propertyView.findFirst({
      where: { propertyId, visitorKey: key, createdAt: { gt: since } },
      select: { id: true },
    });
    if (seen) return;
    await this.prisma.$transaction([
      this.prisma.propertyView.create({ data: { propertyId, visitorKey: key } }),
      this.prisma.property.update({ where: { id: propertyId }, data: { viewCount: { increment: 1 } } }),
    ]);
  }
}
