import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CompanyContactDto } from '@saghf/types';
import { SettingsService } from './settings.service';
import { UpdateCompanyContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('settings')
@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings/contact')
  @ApiOperation({ summary: 'اطلاعات تماس شرکت (عمومی)' })
  getContact(): Promise<CompanyContactDto> {
    return this.settings.getCompanyContact();
  }

  @Patch('admin/settings/contact')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش اطلاعات تماس شرکت' })
  updateContact(@Body() dto: UpdateCompanyContactDto): Promise<CompanyContactDto> {
    return this.settings.updateCompanyContact(dto);
  }
}
