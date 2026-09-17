"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createFeeSchema, recordPaymentSchema } from "@/lib/validations/fee";

export async function createFeeAction(formData: FormData) {
  const parsed = createFeeSchema.safeParse({
    target: formData.get("target"),
    class_id: formData.get("class_id") || undefined,
    student_id: formData.get("student_id") || undefined,
    title: formData.get("title"),
    amount: formData.get("amount"),
    due_date: formData.get("due_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { target, class_id, student_id, title, amount, due_date } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (target === "class") {
    if (!class_id) return { error: "Select a class" };

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id")
      .eq("class_id", class_id)
      .eq("is_active", true);

    if (studentsError) return { error: studentsError.message };
    if (!students || students.length === 0) {
      return { error: "This class has no active students." };
    }

    const { error } = await supabase.from("fees").insert(
      students.map((s) => ({
        student_id: s.id,
        class_id,
        title,
        amount,
        due_date,
        created_by: user?.id,
      })),
    );

    if (error) return { error: error.message };
  } else {
    if (!student_id) return { error: "Select a student" };

    const { data: student } = await supabase
      .from("students")
      .select("class_id")
      .eq("id", student_id)
      .single();

    const { error } = await supabase.from("fees").insert({
      student_id,
      class_id: student?.class_id ?? null,
      title,
      amount,
      due_date,
      created_by: user?.id,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/fees");
  redirect("/admin/fees");
}

export async function recordPaymentAction(formData: FormData) {
  const parsed = recordPaymentSchema.safeParse({
    fee_id: formData.get("fee_id"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("payments").insert({
    fee_id: parsed.data.fee_id,
    amount: parsed.data.amount,
    method: parsed.data.method,
    notes: parsed.data.notes || null,
    recorded_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/fees");
  revalidatePath(`/admin/fees/${parsed.data.fee_id}`);
  revalidatePath("/admin/payments");
  return { success: true };
}
