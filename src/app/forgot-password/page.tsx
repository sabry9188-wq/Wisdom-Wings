"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Always show the same message, whether or not the email exists —
    // avoids leaking which addresses have accounts.
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <AuthCard title="Forgot password" subtitle="We'll email you a reset link">
      {submitted ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            If an account exists for <span className="font-medium">{email}</span>,
            a password reset link has been sent.
          </p>
          <Link href="/login" className="text-sm text-indigo-600 hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="text-indigo-600 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
