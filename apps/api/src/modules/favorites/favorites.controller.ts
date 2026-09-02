import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyCardDto } from '@saghf/types';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get('me/favorites')
  @ApiOperation({ summary: 'ملک‌های ذخیره‌شده کاربر' })
  list(@CurrentUser() user: RequestUser): Promise<PropertyCardDto[]> {
    return this.favorites.list(user.id);
  }

  @Get('me/favorites/ids')
  @ApiOperation({ summary: 'شناسه ملک‌های ذخیره‌شده' })
  ids(@CurrentUser() user: RequestUser): Promise<string[]> {
    return this.favorites.ids(user.id);
  }

  @Post('favorites/:propertyId')
  @ApiOperation({ summary: 'افزودن به علاقه‌مندی‌ها' })
  add(@CurrentUser() user: RequestUser, @Param('propertyId') propertyId: string) {
    return this.favorites.add(user.id, propertyId);
  }

  @Delete('favorites/:propertyId')
  @ApiOperation({ summary: 'حذف از علاقه‌مندی‌ها' })
  remove(@CurrentUser() user: RequestUser, @Param('propertyId') propertyId: string) {
    return this.favorites.remove(user.id, propertyId);
  }
}
