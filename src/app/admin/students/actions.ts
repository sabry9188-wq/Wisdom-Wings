"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { studentSchema } from "@/lib/validations/student";
import type { Database } from "@/types/database";

function readStudentForm(formData: FormData) {
  return studentSchema.safeParse({
    student_code: formData.get("student_code"),
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    class_id: formData.get("class_id"),
    contact_phone: formData.get("contact_phone"),
    contact_address: formData.get("contact_address"),
  });
}

export async function createStudentAction(formData: FormData) {
  const parsed = readStudentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = String(formData.get("id"));
  const photoPath = formData.get("photo_path");
  const supabase = await createClient();

  const { error } = await supabase.from("students").insert({
    id,
    student_code: parsed.data.student_code,
    full_name: parsed.data.full_name,
    date_of_birth: parsed.data.date_of_birth || null,
    gender: (parsed.data.gender || null) as "male" | "female" | "other" | null,
    class_id: parsed.data.class_id || null,
    contact_phone: parsed.data.contact_phone || null,
    contact_address: parsed.data.contact_address || null,
    photo_url: typeof photoPath === "string" && photoPath ? photoPath : null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That student code is already in use." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudentAction(formData: FormData) {
  const parsed = readStudentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = String(formData.get("id"));
  const photoPath = formData.get("photo_path");
  const supabase = await createClient();

  const update: Database["public"]["Tables"]["students"]["Update"] = {
    student_code: parsed.data.student_code,
    full_name: parsed.data.full_name,
    date_of_birth: parsed.data.date_of_birth || null,
    gender: (parsed.data.gender || null) as "male" | "female" | "other" | null,
    class_id: parsed.data.class_id || null,
    contact_phone: parsed.data.contact_phone || null,
    contact_address: parsed.data.contact_address || null,
  };

  if (typeof photoPath === "string" && photoPath) {
    update.photo_url = photoPath;
  }

  const { error } = await supabase.from("students").update(update).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That student code is already in use." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  redirect(`/admin/students/${id}`);
}

export async function toggleStudentActiveAction(
  studentId: string,
  isActive: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ is_active: isActive })
    .eq("id", studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}
