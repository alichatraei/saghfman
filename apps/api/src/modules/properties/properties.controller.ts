import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MyPropertyDto, Paginated, PropertyCardDto, PropertyDetailDto } from '@saghf/types';
import { PropertiesService } from './properties.service';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'فهرست آگهی‌های منتشرشده با فیلتر و مرتب‌سازی' })
  list(@Query() query: QueryPropertyDto): Promise<Paginated<PropertyCardDto>> {
    return this.properties.findPublic(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'آگهی‌های ویژه' })
  featured(@Query('limit') limit?: number): Promise<PropertyCardDto[]> {
    return this.properties.findFeatured(Number(limit) || 8);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'آدرس آگهی‌های منتشرشده برای sitemap' })
  sitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.properties.findAllPublishedSlugs();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'جزئیات آگهی — بدون هیچ اطلاعات تماس مالک' })
  detail(@Param('slug') slug: string, @Req() req: Request): Promise<PropertyDetailDto> {
    return this.properties.findBySlug(slug, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Get(':slug/similar')
  @ApiOperation({ summary: 'آگهی‌های مشابه' })
  similar(@Param('slug') slug: string): Promise<PropertyCardDto[]> {
    return this.properties.findSimilar(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ثبت آگهی جدید (در انتظار بررسی ذخیره می‌شود)' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePropertyDto): Promise<MyPropertyDto> {
    return this.properties.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش آگهی' })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<MyPropertyDto> {
    return this.properties.update(user.id, id, dto, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف آگهی' })
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<void> {
    return this.properties.remove(user.id, id, user.role);
  }

  @Patch(':id/renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تمدید آگهی' })
  renew(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<MyPropertyDto> {
    return this.properties.renew(user.id, id, user.role);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'غیرفعال کردن آگهی' })
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<MyPropertyDto> {
    return this.properties.setActive(user.id, id, false, user.role);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فعال‌سازی مجدد آگهی (ارسال به بررسی)' })
  activate(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<MyPropertyDto> {
    return this.properties.setActive(user.id, id, true, user.role);
  }
}
