"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { classSchema } from "@/lib/validations/class";

function readClassForm(formData: FormData) {
  return classSchema.safeParse({
    name: formData.get("name"),
    section: formData.get("section"),
    academic_year: formData.get("academic_year"),
  });
}

export async function createClassAction(formData: FormData) {
  const parsed = readClassForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: parsed.data.name,
      section: parsed.data.section || null,
      academic_year: parsed.data.academic_year || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create class" };
  }

  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${data.id}`);
}

export async function updateClassAction(formData: FormData) {
  const parsed = readClassForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      section: parsed.data.section || null,
      academic_year: parsed.data.academic_year || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
  redirect(`/admin/classes/${id}`);
}

export async function toggleClassActiveAction(classId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("classes")
    .update({ is_active: isActive })
    .eq("id", classId);

  if (error) return { error: error.message };

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classId}`);
  return { success: true };
}

export async function syncClassTeachersAction(
  classId: string,
  teacherIds: string[],
) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("class_teachers")
    .delete()
    .eq("class_id", classId);

  if (deleteError) return { error: deleteError.message };

  if (teacherIds.length > 0) {
    const { error: insertError } = await supabase.from("class_teachers").insert(
      teacherIds.map((teacherId) => ({ class_id: classId, teacher_id: teacherId })),
    );
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/admin/classes/${classId}`);
  return { success: true };
}

export async function syncTeacherClassesAction(
  teacherId: string,
  classIds: string[],
) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("class_teachers")
    .delete()
    .eq("teacher_id", teacherId);

  if (deleteError) return { error: deleteError.message };

  if (classIds.length > 0) {
    const { error: insertError } = await supabase.from("class_teachers").insert(
      classIds.map((classId) => ({ class_id: classId, teacher_id: teacherId })),
    );
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/admin/teachers/${teacherId}`);
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function assignStudentsToClassAction(
  classId: string,
  studentIds: string[],
) {
  if (studentIds.length === 0) return { success: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ class_id: classId })
    .in("id", studentIds);

  if (error) return { error: error.message };

  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin/students");
  return { success: true };
}
