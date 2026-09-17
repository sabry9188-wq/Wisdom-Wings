"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/input";
import type { UserRole } from "@/types/database";

export function CreateUserForm({ role }: { role: Extract<UserRole, "teacher" | "parent"> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ tempPassword: string } | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("role", role);
    formData.set("full_name", fullName);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("date_of_birth", dateOfBirth);
    formData.set("gender", gender);
    formData.set("address", address);
    formData.set("subject", subject);
    if (photoFile) formData.set("photo", photoFile);

    const res = await fetch("/api/admin/users", { method: "POST", body: formData });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? "Something went wrong.");
      return;
    }

    setCreated({ tempPassword: body.tempPassword });
  }

  if (created) {
    const listHref = role === "teacher" ? "/admin/teachers" : "/admin/parents";
    return (
      <div className="max-w-md rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="font-medium text-green-900">Account created for {email}</p>
        <p className="mt-2 text-sm text-green-800">
          Temporary password (shown once — share it securely with the new user):
        </p>
        <code className="mt-1 block rounded bg-white px-3 py-2 font-mono text-sm text-slate-900">
          {created.tempPassword}
        </code>
        <p className="mt-2 text-xs text-green-700">
          They should sign in and change their password, or use &ldquo;Forgot
          password&rdquo; on the login page.
        </p>
        <Link href={listHref} className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {role === "teacher" ? (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreview ?? "/avatar-placeholder.svg"}
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
        <Input
          id="full_name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Phone" htmlFor="phone">
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>

      {role === "teacher" ? (
        <>
          <FormField label="Date of birth" htmlFor="date_of_birth">
            <Input
              id="date_of_birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </FormField>
          <FormField label="Gender" htmlFor="gender">
            <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Address" htmlFor="address">
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <FormField label="Subject(s) taught" htmlFor="subject">
            <Input
              id="subject"
              placeholder="e.g. Mathematics, Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormField>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : `Create ${role}`}
      </Button>
    </form>
  );
}
