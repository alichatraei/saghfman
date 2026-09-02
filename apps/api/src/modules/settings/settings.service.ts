import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CompanyContactDto } from '@saghf/types';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * The company contact block shown on every public property page.
 * The phone number is stored in the database (admin-editable) — it is never
 * hardcoded in the frontend, and it never comes from the property owner.
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getCompanyContact(): Promise<CompanyContactDto> {
    const setting = await this.prisma.companySetting.findUnique({ where: { id: 'default' } });
    if (setting) {
      return {
        companyName: setting.companyName,
        primaryPhone: setting.primaryPhone,
        secondaryPhone: setting.secondaryPhone,
        whatsapp: setting.whatsapp,
        messengerPhone: setting.messengerPhone,
        workingHours: setting.workingHours,
        tagline: setting.tagline,
        socials: {
          telegram: setting.telegram,
          whatsappLink: setting.whatsappLink,
          rubika: setting.rubika,
          bale: setting.bale,
          eitaa: setting.eitaa,
          instagram: setting.instagram,
        },
      };
    }
    return {
      companyName: this.config.get<string>('company.name') ?? 'سقف من',
      primaryPhone: this.config.get<string>('company.phone') ?? '021-91001234',
      secondaryPhone: this.config.get<string>('company.secondaryPhone') || null,
      whatsapp: this.config.get<string>('company.whatsapp') || null,
      messengerPhone: this.config.get<string>('company.whatsapp') || null,
      workingHours: this.config.get<string>('company.workingHours') || null,
      tagline: 'مشاور و مجری املاک',
      socials: {
        telegram: null,
        whatsappLink: null,
        rubika: null,
        bale: null,
        eitaa: null,
        instagram: null,
      },
    };
  }

  async updateCompanyContact(input: {
    companyName?: string;
    tagline?: string | null;
    primaryPhone?: string;
    secondaryPhone?: string | null;
    whatsapp?: string | null;
    messengerPhone?: string | null;
    email?: string | null;
    address?: string | null;
    workingHours?: string | null;
    instagram?: string | null;
    telegram?: string | null;
    whatsappLink?: string | null;
    rubika?: string | null;
    bale?: string | null;
    eitaa?: string | null;
  }): Promise<CompanyContactDto> {
    const current = await this.getCompanyContact();
    await this.prisma.companySetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        companyName: input.companyName ?? current.companyName,
        primaryPhone: input.primaryPhone ?? current.primaryPhone,
        secondaryPhone: input.secondaryPhone ?? current.secondaryPhone,
        whatsapp: input.whatsapp ?? current.whatsapp,
        workingHours: input.workingHours ?? current.workingHours,
        tagline: input.tagline ?? current.tagline,
        email: input.email ?? null,
        address: input.address ?? null,
        instagram: input.instagram ?? null,
        telegram: input.telegram ?? null,
      },
      update: { ...input },
    });
    return this.getCompanyContact();
  }
}
