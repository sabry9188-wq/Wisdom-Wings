import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSmsProvider } from "@/lib/sms";
import { getGuardianRecipients } from "@/lib/sms/recipients";
import { sendSmsSchema } from "@/lib/validations/sms";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Database, SmsType } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sendSmsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const provider = getSmsProvider();

  // messagesByStudent: one entry per student this send targets, with the
  // exact text to send that student's guardians.
  const messagesByStudent = new Map<string, string>();

  if (input.type === "fee_reminder") {
    const { data: fees } = await supabase
      .from("fees")
      .select("student_id, title, amount, due_date, students(full_name)")
      .in("id", input.feeIds);

    for (const fee of fees ?? []) {
      const name = fee.students?.full_name ?? "your child";
      messagesByStudent.set(
        fee.student_id,
        `Reminder: ${fee.title} (${formatCurrency(Number(fee.amount))}) for ${name} is due on ${formatDate(fee.due_date)}. Please arrange payment.`,
      );
    }
  } else if (input.type === "absence_alert") {
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name")
      .in("id", input.studentIds);

    for (const s of students ?? []) {
      messagesByStudent.set(
        s.id,
        `${s.full_name} was marked absent on ${formatDate(input.date)}. Please contact the school if this is unexpected.`,
      );
    }
  } else {
    for (const studentId of input.studentIds) {
      messagesByStudent.set(studentId, input.message);
    }
  }

  const studentIds = [...messagesByStudent.keys()];
  const recipients = await getGuardianRecipients(supabase, studentIds);

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No guardians with a phone number on file for the selected student(s)." },
      { status: 400 },
    );
  }

  let sent = 0;
  let failed = 0;

  const logs: Database["public"]["Tables"]["sms_logs"]["Insert"][] = [];

  for (const recipient of recipients) {
    const message = messagesByStudent.get(recipient.studentId);
    if (!message) continue;

    const result = await provider.send(recipient.phone, message);
    if (result.status === "sent") sent++;
    else failed++;

    logs.push({
      recipient_phone: recipient.phone,
      recipient_user_id: recipient.parentId,
      student_id: recipient.studentId,
      type: input.type as SmsType,
      message,
      status: result.status,
      provider: provider.name,
      provider_message_id: result.providerMessageId,
      error_message: result.errorMessage,
      sent_by: caller.id,
    });
  }

  await supabase.from("sms_logs").insert(logs);

  return NextResponse.json({ sent, failed, total: recipients.length });
}
