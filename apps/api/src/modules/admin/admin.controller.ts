import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminDashboardDto, AdminPropertyDto, AdminUserDto, Paginated } from '@saghf/types';
import { AdminService } from './admin.service';
import {
  AdminPropertyQueryDto,
  AdminUserQueryDto,
  FeaturePropertyDto,
  RejectPropertyDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'آمار کلی سامانه' })
  dashboard(): Promise<AdminDashboardDto> {
    return this.admin.dashboard();
  }

  @Get('properties')
  @ApiOperation({ summary: 'فهرست آگهی‌ها همراه با شماره تماس مالک (فقط مدیران)' })
  properties(@Query() query: AdminPropertyQueryDto): Promise<Paginated<AdminPropertyDto>> {
    return this.admin.listProperties(query);
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'جزئیات کامل آگهی برای بررسی' })
  property(@Param('id') id: string): Promise<AdminPropertyDto> {
    return this.admin.getProperty(id);
  }

  @Patch('properties/:id/approve')
  @ApiOperation({ summary: 'تأیید و انتشار آگهی' })
  approve(@Param('id') id: string, @CurrentUser() user: RequestUser): Promise<AdminPropertyDto> {
    return this.admin.approve(id, user.id);
  }

  @Patch('properties/:id/reject')
  @ApiOperation({ summary: 'رد آگهی همراه با دلیل' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectPropertyDto,
    @CurrentUser() user: RequestUser,
  ): Promise<AdminPropertyDto> {
    return this.admin.reject(id, dto.reason, user.id);
  }

  @Patch('properties/:id/feature')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'ویژه کردن آگهی' })
  feature(
    @Param('id') id: string,
    @Body() dto: FeaturePropertyDto,
    @CurrentUser() user: RequestUser,
  ): Promise<AdminPropertyDto> {
    return this.admin.feature(id, dto.featured, user.id);
  }

  @Patch('properties/:id/expire')
  @ApiOperation({ summary: 'پایان دادن به آگهی' })
  expire(@Param('id') id: string, @CurrentUser() user: RequestUser): Promise<AdminPropertyDto> {
    return this.admin.expire(id, user.id);
  }

  @Delete('properties/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'حذف آگهی' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser): Promise<void> {
    return this.admin.deleteProperty(id, user.id);
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'فهرست کاربران' })
  users(@Query() query: AdminUserQueryDto): Promise<Paginated<AdminUserDto>> {
    return this.admin.listUsers(query);
  }

  @Patch('users/:id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'تغییر وضعیت کاربر (فعال/تعلیق/مسدود)' })
  setUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: RequestUser,
  ): Promise<AdminUserDto> {
    return this.admin.setUserStatus(id, dto.status, user.id);
  }
}
