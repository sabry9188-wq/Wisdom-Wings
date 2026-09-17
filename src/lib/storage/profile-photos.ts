import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "profile-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

/** Private bucket for staff profile pictures — signed URLs, like student photos. */
export async function getSignedProfilePhotoUrl(
  supabase: SupabaseClient<Database>,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function getSignedProfilePhotoUrls(
  supabase: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter((p): p is string => !!p))];
  if (uniquePaths.length === 0) return new Map();

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  const map = new Map<string, string>();
  data?.forEach((entry) => {
    if (entry.signedUrl && entry.path) {
      map.set(entry.path, entry.signedUrl);
    }
  });
  return map;
}

/** Client-side upload — call with the browser Supabase client. */
export async function uploadProfilePhoto(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<{ path: string | null; error: string | null }> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { path: null, error: error.message };
  }

  return { path, error: null };
}
