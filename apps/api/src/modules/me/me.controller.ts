import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyStatus } from '@prisma/client';
import { AuthUserDto, MyPropertyDetailDto, MyPropertyDto, NotificationDto } from '@saghf/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly properties: PropertiesService,
    private readonly users: UsersService,
  ) {}

  @Get('properties')
  @ApiOperation({ summary: 'آگهی‌های من' })
  listMine(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: PropertyStatus,
  ): Promise<MyPropertyDto[]> {
    return this.properties.listMine(user.id, status);
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'جزئیات یکی از آگهی‌های من (برای فرم ویرایش)' })
  getMine(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<MyPropertyDetailDto> {
    return this.properties.getMineById(user.id, id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'پروفایل کاربر' })
  profile(@CurrentUser() user: RequestUser): Promise<AuthUserDto> {
    return this.users.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'ویرایش پروفایل' })
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.users.updateProfile(user.id, dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'اعلان‌های کاربر' })
  notifications(@CurrentUser() user: RequestUser): Promise<NotificationDto[]> {
    return this.users.listNotifications(user.id);
  }
}
