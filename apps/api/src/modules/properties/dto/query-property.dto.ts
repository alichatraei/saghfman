import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PropertySort } from '@saghf/types';

const toBool = ({ value }: { value: unknown }): boolean | undefined => {
  if (value === undefined || value === '') return undefined;
  return value === true || value === 'true' || value === '1';
};

export class QueryPropertyDto {
  @ApiPropertyOptional({ description: 'جستجوی متنی در عنوان، محله و توضیحات' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() neighborhood?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() propertyType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() transaction?: string;

  @ApiPropertyOptional({
    enum: ['buy', 'rent'],
    description: 'جستجوی گروهی: buy شامل فروش/پیش‌فروش/معاوضه و rent شامل انواع اجاره است.',
  })
  @IsOptional()
  @IsIn(['buy', 'rent'])
  transactionGroup?: 'buy' | 'rent';

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;
  @ApiPropertyOptional({ description: 'حداقل ودیعه — مخصوص جستجوی اجاره' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDeposit?: number;

  @ApiPropertyOptional({ description: 'حداکثر ودیعه — مخصوص جستجوی اجاره' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDeposit?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) minArea?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxArea?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10) rooms?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() minYear?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() maxYear?: number;

  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() parking?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() elevator?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() storage?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() balcony?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() featured?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : String(value).split(',').filter(Boolean)))
  @IsArray()
  amenities?: string[];

  @ApiPropertyOptional({ enum: ['newest', 'price_desc', 'price_asc', 'area_desc'] })
  @IsOptional()
  @IsIn(['newest', 'price_desc', 'price_asc', 'area_desc'])
  sort?: PropertySort;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  pageSize?: number;
}
