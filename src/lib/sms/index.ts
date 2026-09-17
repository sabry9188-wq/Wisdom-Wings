import "server-only";
import type { SmsProvider } from "@/lib/sms/types";
import { ConsoleSmsProvider } from "@/lib/sms/providers/console-provider";

/**
 * Factory keyed off SMS_PROVIDER. Adding a real gateway later (Twilio, a
 * local aggregator, etc.) means writing one new provider file and adding
 * one case here — no changes needed in the callers under /api/sms.
 */
export function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return new ConsoleSmsProvider();
    default:
      throw new Error(`Unknown SMS_PROVIDER: "${provider}"`);
  }
}
