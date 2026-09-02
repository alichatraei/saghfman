import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMS_PROVIDER, SmsProvider } from './sms-provider.interface';
import { MockSmsProvider } from './mock-sms.provider';
import { KavenegarSmsProvider } from './kavenegar-sms.provider';
import { SmsIrProvider } from './smsir-sms.provider';
import { MelipayamakSmsProvider } from './melipayamak-sms.provider';

/** Chooses the gateway from SMS_PROVIDER at boot; nothing else knows the brand. */
export function createSmsProvider(config: ConfigService): SmsProvider {
  const provider = config.get<string>('sms.provider') ?? 'mock';
  const apiKey = config.get<string>('sms.apiKey') ?? '';
  const sender = config.get<string>('sms.sender') ?? '';
  const template = config.get<string>('sms.template') ?? '';

  switch (provider) {
    case 'kavenegar':
      return new KavenegarSmsProvider(apiKey, template);
    case 'smsir':
      return new SmsIrProvider(apiKey, template);
    case 'melipayamak':
      return new MelipayamakSmsProvider(apiKey, sender);
    default:
      return new MockSmsProvider();
  }
}

@Module({
  providers: [{ provide: SMS_PROVIDER, useFactory: createSmsProvider, inject: [ConfigService] }],
  exports: [SMS_PROVIDER],
})
export class SmsModule {}
