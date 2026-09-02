import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCompanyContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) tagline?: string;
  @ApiPropertyOptional({ example: '021-91001234' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  primaryPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) secondaryPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) whatsapp?: string;

  @ApiPropertyOptional({ description: 'شماره تلفن پیام‌رسان (تلگرام، واتساپ، روبیکا و …)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  messengerPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) workingHours?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) instagram?: string;
  @ApiPropertyOptional({ description: 'آدرس یا آی‌دی تلگرام' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  telegram?: string;

  @ApiPropertyOptional({ description: 'لینک واتساپ (اختیاری، جدا از شماره واتساپ)' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  whatsappLink?: string;

  @ApiPropertyOptional({ description: 'آدرس یا آی‌دی روبیکا' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  rubika?: string;

  @ApiPropertyOptional({ description: 'آدرس یا آی‌دی بله' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  bale?: string;

  @ApiPropertyOptional({ description: 'آدرس یا آی‌دی ایتا' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  eitaa?: string;
}
