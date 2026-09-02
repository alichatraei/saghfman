import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  CabinetType,
  CoolingType,
  DeedType,
  FloorMaterial,
  HeatingType,
  WallMaterial,
} from '@saghf/types';
import { toEnglishDigits } from '../../../common/utils/slug.util';

const digits = ({ value }: { value: unknown }): string | undefined =>
  value === undefined || value === null || value === '' ? undefined : toEnglishDigits(String(value));

export class PropertyImageInputDto {
  @ApiProperty({ description: 'مسیر فایل آپلود شده از /uploads/images' })
  @IsString()
  url!: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isCover?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() order?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 160) alt?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() width?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() height?: number;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'آپارتمان ۱۲۵ متری شهرک غرب' })
  @IsString()
  @Length(10, 40, { message: 'عنوان آگهی باید بین ۱۰ تا ۴۰ کاراکتر باشد.' })
  title!: string;

  @ApiProperty()
  @IsString()
  @Length(0, 700, { message: 'توضیحات نباید بیشتر از ۷۰۰ کاراکتر باشد.' })
  description!: string;

  @ApiProperty({ description: 'slug نوع ملک، مثلاً apartment' })
  @IsString()
  propertyType!: string;

  @ApiProperty({ description: 'slug نوع معامله، مثلاً sale' })
  @IsString()
  transaction!: string;

  @ApiProperty({ description: 'slug محله' })
  @IsString()
  neighborhood!: string;

  @ApiProperty({ description: 'آدرس کامل — فقط برای مدیران قابل مشاهده است.' })
  @IsString()
  @Length(5, 300)
  address!: string;

  @ApiPropertyOptional({ description: 'آدرس نمایشی عمومی (اختیاری)' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  displayAddress?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  showExactLocation?: boolean;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) longitude?: number;

  @ApiProperty({ example: 125 })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(100000)
  area!: number;

  @ApiPropertyOptional({ description: 'متراژ سالن / پذیرایی' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  hallArea?: number;

  @ApiPropertyOptional({ description: 'متراژ زمین — فقط برای ویلا، خانه، زمین و باغ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  landArea?: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  rooms!: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10) bathrooms?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(-3) @Max(200) floor?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) totalFloors?: number;

  @ApiPropertyOptional({ example: 1396 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1330)
  @Max(1450)
  constructionYear?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(20) parkingCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasElevator?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasStorage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasBalcony?: boolean;

  @ApiPropertyOptional({ enum: DeedType })
  @IsOptional()
  @IsEnum(DeedType)
  deedType?: DeedType;

  @ApiPropertyOptional({ enum: HeatingType, description: 'گرمایش' })
  @IsOptional()
  @IsEnum(HeatingType)
  heating?: HeatingType;

  @ApiPropertyOptional({ enum: CoolingType, description: 'سرمایش' })
  @IsOptional()
  @IsEnum(CoolingType)
  cooling?: CoolingType;

  @ApiPropertyOptional({ enum: CabinetType, description: 'جنس کابینت' })
  @IsOptional()
  @IsEnum(CabinetType)
  cabinet?: CabinetType;

  @ApiPropertyOptional({ enum: FloorMaterial, description: 'کف‌پوش' })
  @IsOptional()
  @IsEnum(FloorMaterial)
  floorMaterial?: FloorMaterial;

  @ApiPropertyOptional({ enum: WallMaterial, description: 'پوشش دیوار' })
  @IsOptional()
  @IsEnum(WallMaterial)
  wallMaterial?: WallMaterial;

  @ApiPropertyOptional({ description: 'قیمت کل به تومان (برای فروش)' })
  @IsOptional()
  @Transform(digits)
  @IsNumberString({}, { message: 'قیمت باید عددی باشد.' })
  price?: string;

  @ApiPropertyOptional({ description: 'ودیعه به تومان (برای رهن و اجاره)' })
  @IsOptional()
  @Transform(digits)
  @IsNumberString({}, { message: 'مبلغ ودیعه باید عددی باشد.' })
  deposit?: string;

  @ApiPropertyOptional({ description: 'اجاره ماهانه به تومان' })
  @IsOptional()
  @Transform(digits)
  @IsNumberString({}, { message: 'اجاره ماهانه باید عددی باشد.' })
  monthlyRent?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isNegotiable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() exchangeable?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'slugهای امکانات' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  amenities?: string[];

  @ApiPropertyOptional({ type: [PropertyImageInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @Type(() => PropertyImageInputDto)
  images?: PropertyImageInputDto[];

  @ApiPropertyOptional({ description: 'true ⇒ ذخیره به‌عنوان پیش‌نویس' })
  @IsOptional()
  @IsBoolean()
  asDraft?: boolean;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
