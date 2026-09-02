import { Logger } from '@nestjs/common';
import { SmsMessage, SmsProvider, SmsSendResult } from './sms-provider.interface';

/** Development provider: logs the message instead of sending it. */
export class MockSmsProvider implements SmsProvider {
  readonly name = 'mock';
  readonly exposesCode = true;
  private readonly logger = new Logger('MockSms');

  async send(message: SmsMessage): Promise<SmsSendResult> {
    this.logger.log(`SMS → ${message.to}: ${message.text}`);
    return { success: true, providerMessageId: `mock-${Date.now()}` };
  }
}
