import { Logger } from '@nestjs/common';
import { SmsMessage, SmsProvider, SmsSendResult } from './sms-provider.interface';

export class KavenegarSmsProvider implements SmsProvider {
  readonly name = 'kavenegar';
  readonly exposesCode = false;
  private readonly logger = new Logger('KavenegarSms');

  constructor(
    private readonly apiKey: string,
    private readonly template: string,
  ) {}

  async send(message: SmsMessage): Promise<SmsSendResult> {
    const token = message.tokens?.code ?? '';
    const url =
      `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json` +
      `?receptor=${encodeURIComponent(message.to)}` +
      `&token=${encodeURIComponent(token)}` +
      `&template=${encodeURIComponent(message.template ?? this.template)}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const payload = (await response.json()) as { return?: { status?: number; message?: string } };
      if (!response.ok || payload.return?.status !== 200) {
        return { success: false, error: payload.return?.message ?? `HTTP ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      this.logger.error('Kavenegar send failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
