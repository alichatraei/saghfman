import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmenityDto, CityDto, NeighborhoodDto, PropertyTypeDto, TransactionTypeDto } from '@saghf/types';
import { TaxonomyService } from './taxonomy.service';

@ApiTags('taxonomy')
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get('property-types')
  @ApiOperation({ summary: 'انواع ملک' })
  propertyTypes(): Promise<PropertyTypeDto[]> {
    return this.taxonomy.propertyTypes();
  }

  @Get('transaction-types')
  @ApiOperation({ summary: 'انواع معامله' })
  transactionTypes(): Promise<TransactionTypeDto[]> {
    return this.taxonomy.transactionTypes();
  }

  @Get('cities')
  @ApiOperation({ summary: 'شهرهای تحت پوشش' })
  cities(): Promise<CityDto[]> {
    return this.taxonomy.cities();
  }

  @Get('neighborhoods')
  @ApiOperation({ summary: 'محله‌ها' })
  neighborhoods(@Query('q') q?: string, @Query('city') city?: string): Promise<NeighborhoodDto[]> {
    return this.taxonomy.neighborhoods(q, city);
  }

  @Get('amenities')
  @ApiOperation({ summary: 'امکانات' })
  amenities(): Promise<AmenityDto[]> {
    return this.taxonomy.amenities();
  }
}
