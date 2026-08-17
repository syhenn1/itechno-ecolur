import "server-only";
import { createClient } from "@supabase/supabase-js";

// Create the "report-photos" bucket in the Supabase dashboard (Storage) and set it to public
// read before this is used — see the README setup steps.
const REPORT_PHOTOS_BUCKET = "report-photos";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Needed for server-side Storage uploads — see env.example.",
    );
  }
  // Service role key bypasses Row Level Security — server-side only, never send to the client.
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function uploadReportPhoto(file: File): Promise<string> {
  const supabase = getServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(REPORT_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  const { data } = supabase.storage.from(REPORT_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
