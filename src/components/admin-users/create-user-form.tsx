"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import type { UserRole } from "@/types/database";

export function CreateUserForm({ role }: { role: Extract<UserRole, "teacher" | "parent"> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ tempPassword: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, full_name: fullName, email, phone }),
    });
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : `Create ${role}`}
      </Button>
    </form>
  );
}
