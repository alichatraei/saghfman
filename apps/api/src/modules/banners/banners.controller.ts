import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminBannerDto, BannerDto } from '@saghf/types';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('banners')
@Controller()
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Get('banners')
  @ApiOperation({ summary: 'بنرهای فعال یک موقعیت (عمومی)' })
  active(@Query('position') position?: string): Promise<BannerDto[]> {
    return this.banners.findActive(position || 'home-top');
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فهرست همه بنرها' })
  list(@Query('position') position?: string): Promise<AdminBannerDto[]> {
    return this.banners.findAll(position);
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ساخت بنر جدید' })
  create(@Body() dto: CreateBannerDto): Promise<AdminBannerDto> {
    return this.banners.create(dto);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش بنر' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto): Promise<AdminBannerDto> {
    return this.banners.update(id, dto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف بنر' })
  remove(@Param('id') id: string): Promise<void> {
    return this.banners.remove(id);
  }
}
