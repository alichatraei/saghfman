import { Logger } from '@nestjs/common';
import { SmsMessage, SmsProvider, SmsSendResult } from './sms-provider.interface';

export class MelipayamakSmsProvider implements SmsProvider {
  readonly name = 'melipayamak';
  readonly exposesCode = false;
  private readonly logger = new Logger('MelipayamakSms');

  constructor(
    private readonly apiKey: string,
    private readonly sender: string,
  ) {}

  async send(message: SmsMessage): Promise<SmsSendResult> {
    try {
      const response = await fetch(`https://console.melipayamak.com/api/send/simple/${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.sender, to: message.to, text: message.text }),
      });
      const payload = (await response.json()) as { recId?: number; status?: string };
      if (!response.ok || !payload.recId) {
        return { success: false, error: payload.status ?? `HTTP ${response.status}` };
      }
      return { success: true, providerMessageId: String(payload.recId) };
    } catch (error) {
      this.logger.error('Melipayamak send failed', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
