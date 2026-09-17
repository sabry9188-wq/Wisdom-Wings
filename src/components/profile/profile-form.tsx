"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import type { CurrentUser } from "@/lib/auth/session";

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [isPending, startTransition] = useTransition();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function onProfileSubmit(formData: FormData) {
    setProfileMessage(null);
    setProfileError(null);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        setProfileError(result.error);
      } else {
        setProfileMessage("Profile updated.");
      }
    });
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile details" />
        <CardBody>
          <form action={onProfileSubmit} className="max-w-md space-y-4">
            <FormField label="Full name" htmlFor="full_name">
              <Input
                id="full_name"
                name="full_name"
                required
                defaultValue={user.full_name}
              />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" value={user.email ?? ""} disabled />
            </FormField>

            {profileError ? (
              <p className="text-sm text-red-600">{profileError}</p>
            ) : null}
            {profileMessage ? (
              <p className="text-sm text-green-600">{profileMessage}</p>
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <CardBody>
          <form onSubmit={onPasswordSubmit} className="max-w-md space-y-4">
            <FormField label="New password" htmlFor="new_password">
              <Input
                id="new_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <FormField label="Confirm password" htmlFor="confirm_password">
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormField>

            {passwordError ? (
              <p className="text-sm text-red-600">{passwordError}</p>
            ) : null}
            {passwordMessage ? (
              <p className="text-sm text-green-600">{passwordMessage}</p>
            ) : null}

            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
