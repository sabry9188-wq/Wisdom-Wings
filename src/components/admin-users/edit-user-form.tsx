"use client";

import { useState, useTransition } from "react";
import { updateUserProfileAction } from "@/lib/auth/admin-user-actions";
import { createClient } from "@/lib/supabase/client";
import { uploadProfilePhoto } from "@/lib/storage/profile-photos";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";
import type { CurrentUser } from "@/lib/auth/session";

export function EditUserForm({
  user,
  listPath,
  photoUrl,
}: {
  user: CurrentUser;
  listPath: string;
  photoUrl?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const isTeacher = user.role === "teacher";

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      if (photoFile) {
        const supabase = createClient();
        const { path, error: uploadError } = await uploadProfilePhoto(
          supabase,
          user.id,
          photoFile,
        );
        if (uploadError) {
          setError(`Photo upload failed: ${uploadError}`);
          return;
        }
        if (path) formData.set("photo_path", path);
      }

      const result = await updateUserProfileAction(user.id, listPath, formData);
      if (result?.error) setError(result.error);
      else setMessage("Saved.");
    });
  }

  return (
    <form action={onSubmit} className="max-w-md space-y-4">
      {isTeacher ? (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? "/avatar-placeholder.svg"}
            alt=""
            className="h-16 w-16 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Profile photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="mt-1 text-sm text-slate-600"
            />
          </div>
        </div>
      ) : null}

      <FormField label="Full name" htmlFor="full_name">
        <Input id="full_name" name="full_name" required defaultValue={user.full_name} />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" value={user.email ?? ""} disabled />
      </FormField>
      <FormField label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
      </FormField>

      {isTeacher ? (
        <>
          <FormField label="Date of birth" htmlFor="date_of_birth">
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={user.date_of_birth ?? ""}
            />
          </FormField>
          <FormField label="Gender" htmlFor="gender">
            <Select id="gender" name="gender" defaultValue={user.gender ?? ""}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input id="address" name="address" defaultValue={user.address ?? ""} />
          </FormField>
          <FormField label="Subject(s) taught" htmlFor="subject">
            <Input
              id="subject"
              name="subject"
              placeholder="e.g. Mathematics, Science"
              defaultValue={user.subject ?? ""}
            />
          </FormField>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
