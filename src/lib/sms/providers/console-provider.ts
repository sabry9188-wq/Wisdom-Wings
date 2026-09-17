import "server-only";
import type { SmsProvider, SmsSendResult } from "@/lib/sms/types";

/**
 * MVP default provider — logs the message instead of sending a real SMS.
 * Lets the fee-reminder/absence-alert workflows and sms_logs table be
 * fully wired end-to-end before a real gateway is connected. Swap the
 * provider by adding a new file here and updating the SMS_PROVIDER env var
 * plus the factory in ./index.ts — calling code never changes.
 */
export class ConsoleSmsProvider implements SmsProvider {
  name = "console";

  async send(to: string, message: string): Promise<SmsSendResult> {
    console.log(`[SMS -> ${to}] ${message}`);
    return {
      status: "sent",
      providerMessageId: `console-${Date.now()}`,
    };
  }
}
