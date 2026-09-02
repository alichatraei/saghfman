import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export const BANNER_VARIANTS = ['info', 'success', 'warning', 'promo'] as const;

export class CreateBannerDto {
  @ApiProperty({ example: 'وام مسکن ویژه پاییز' })
  @IsString()
  @Length(3, 120, { message: 'عنوان بنر باید بین ۳ تا ۱۲۰ کاراکتر باشد.' })
  title!: string;

  @ApiPropertyOptional({ description: 'متن توضیحی بنر' })
  @IsOptional()
  @IsString()
  @Length(0, 400, { message: 'متن بنر نباید بیشتر از ۴۰۰ کاراکتر باشد.' })
  message?: string;

  @ApiPropertyOptional({ enum: BANNER_VARIANTS, default: 'info' })
  @IsOptional()
  @IsIn(BANNER_VARIANTS, { message: 'نوع بنر معتبر نیست.' })
  variant?: (typeof BANNER_VARIANTS)[number];

  @ApiPropertyOptional({ example: 'مشاهده آگهی‌ها' })
  @IsOptional()
  @IsString()
  @Length(0, 40)
  ctaLabel?: string;

  @ApiPropertyOptional({ example: '/properties?transaction=sale' })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  linkUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 300) imageUrl?: string;

  @ApiPropertyOptional({ default: 'home-top' })
  @IsOptional()
  @IsString()
  @Length(0, 40)
  position?: string;

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() dismissible?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'شروع نمایش (ISO). خالی یعنی از همین حالا.' })
  @IsOptional()
  @IsDateString({}, { message: 'تاریخ شروع معتبر نیست.' })
  startsAt?: string;

  @ApiPropertyOptional({ description: 'پایان نمایش (ISO). خالی یعنی بدون انقضا.' })
  @IsOptional()
  @IsDateString({}, { message: 'تاریخ پایان معتبر نیست.' })
  endsAt?: string;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
