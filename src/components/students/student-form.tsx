"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadStudentPhoto } from "@/lib/storage/student-photos";
import { createStudentAction, updateStudentAction } from "@/app/admin/students/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";
import type { Database } from "@/types/database";

type ClassOption = Pick<Database["public"]["Tables"]["classes"]["Row"], "id" | "name" | "section">;
type Student = Database["public"]["Tables"]["students"]["Row"];

export function StudentForm({
  mode,
  student,
  classes,
  photoUrl,
}: {
  mode: "create" | "edit";
  student?: Student;
  classes: ClassOption[];
  photoUrl?: string | null;
}) {
  const [id] = useState(() => student?.id ?? crypto.randomUUID());
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      formData.set("id", id);

      if (photoFile) {
        const supabase = createClient();
        const { path, error: uploadError } = await uploadStudentPhoto(
          supabase,
          id,
          photoFile,
        );
        if (uploadError) {
          setError(`Photo upload failed: ${uploadError}`);
          return;
        }
        if (path) formData.set("photo_path", path);
      }

      const action = mode === "create" ? createStudentAction : updateStudentAction;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="max-w-2xl space-y-6">
      <input type="hidden" name="id" value={id} />

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview ?? "/avatar-placeholder.svg"}
          alt=""
          className="h-16 w-16 rounded-full border border-slate-200 object-cover"
        />
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Student photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="mt-1 text-sm text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Student code" htmlFor="student_code">
          <Input
            id="student_code"
            name="student_code"
            required
            defaultValue={student?.student_code}
          />
        </FormField>
        <FormField label="Full name" htmlFor="full_name">
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={student?.full_name}
          />
        </FormField>
        <FormField label="Date of birth" htmlFor="date_of_birth">
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            defaultValue={student?.date_of_birth ?? ""}
          />
        </FormField>
        <FormField label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={student?.gender ?? ""}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Class" htmlFor="class_id">
          <Select id="class_id" name="class_id" defaultValue={student?.class_id ?? ""}>
            <option value="">Unassigned</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` - ${c.section}` : ""}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Contact phone" htmlFor="contact_phone">
          <Input
            id="contact_phone"
            name="contact_phone"
            defaultValue={student?.contact_phone ?? ""}
          />
        </FormField>
        <FormField label="Address" htmlFor="contact_address">
          <Input
            id="contact_address"
            name="contact_address"
            defaultValue={student?.contact_address ?? ""}
          />
        </FormField>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Add student" : "Save changes"}
      </Button>
    </form>
  );
}
