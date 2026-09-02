import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { toEnglishDigits } from '../../../common/utils/slug.util';

export class RequestOtpDto {
  @ApiProperty({ example: '09123456789', description: 'شماره موبایل کاربر' })
  @Transform(({ value }) => toEnglishDigits(String(value ?? '')).trim())
  @IsString()
  @Length(10, 14, { message: 'شماره موبایل معتبر نیست.' })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '09123456789' })
  @Transform(({ value }) => toEnglishDigits(String(value ?? '')).trim())
  @IsString()
  @Length(10, 14, { message: 'شماره موبایل معتبر نیست.' })
  phone!: string;

  @ApiProperty({ example: '12345', description: 'کد یکبار مصرف' })
  @Transform(({ value }) => toEnglishDigits(String(value ?? '')).trim())
  @IsString()
  @Matches(/^\d{4,6}$/, { message: 'کد وارد شده معتبر نیست.' })
  code!: string;
}
