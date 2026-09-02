import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'محمد رضایی' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  fullName?: string;

  @ApiPropertyOptional({ example: 'm.rezaei@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 300) avatarUrl?: string;
  @ApiPropertyOptional({ example: 'تهران' }) @IsOptional() @IsString() @Length(0, 60) city?: string;
  @ApiPropertyOptional({ description: 'slug نوع معامله مورد علاقه' })
  @IsOptional()
  @IsString()
  preferredTransaction?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  preferredAreas?: string[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifyBySms?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifyByEmail?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifyOnMatch?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hidePhoneFromListings?: boolean;
}
