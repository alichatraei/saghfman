export interface SmsMessage {
  to: string;
  text: string;
  /** Template identifier for providers that require pattern-based sending. */
  template?: string;
  /** Template tokens, e.g. { code: '12345' }. */
  tokens?: Record<string, string>;
}

export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

/**
 * Every SMS gateway must implement this interface. Authentication code never
 * talks to a concrete gateway, so adding Kavenegar/SMS.ir/Melipayamak (or a
 * new provider) requires no change in AuthService.
 */
export interface SmsProvider {
  readonly name: string;
  send(message: SmsMessage): Promise<SmsSendResult>;
  /** True when the provider echoes the code back for development use. */
  readonly exposesCode: boolean;
}
