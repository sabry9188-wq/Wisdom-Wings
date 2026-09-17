export interface SmsSendResult {
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
}

export interface SmsProvider {
  name: string;
  send(to: string, message: string): Promise<SmsSendResult>;
}
