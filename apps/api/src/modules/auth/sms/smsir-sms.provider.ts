import { Logger } from '@nestjs/common';
import { SmsMessage, SmsProvider, SmsSendResult } from './sms-provider.interface';

export class SmsIrProvider implements SmsProvider {
  readonly name = 'smsir';
  readonly exposesCode = false;
  private readonly logger = new Logger('SmsIr');

  constructor(
    private readonly apiKey: string,
    private readonly templateId: string,
  ) {}

  async send(message: SmsMessage): Promise<SmsSendResult> {
    try {
      const response = await fetch('https://api.sms.ir/v1/send/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
        body: JSON.stringify({
          mobile: message.to,
          templateId: Number(message.template ?? this.templateId),
          parameters: Object.entries(message.tokens ?? {}).map(([name, value]) => ({ name, value })),
        }),
      });
      const payload = (await response.json()) as { status?: number; message?: string };
      if (!response.ok || payload.status !== 1) {
        return { success: false, error: payload.message ?? `HTTP ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      this.logger.error('SMS.ir send failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
