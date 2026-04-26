import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const PROFILE_PHOTO_BUCKET = "profile-photos";

function safeExtension(fileName: string, contentType: string) {
  const byName = fileName.split(".").pop()?.toLowerCase();
  if (byName && /^[a-z0-9]+$/.test(byName)) return byName;
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
    }

    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 6MB" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { data: bucket } = await admin.storage.getBucket(PROFILE_PHOTO_BUCKET);
    if (!bucket) {
      const { error: bucketError } = await admin.storage.createBucket(PROFILE_PHOTO_BUCKET, {
        public: true,
        fileSizeLimit: 6291456,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/jpg"],
      });
      if (bucketError && !String(bucketError.message || "").toLowerCase().includes("already exists")) {
        throw bucketError;
      }
    }

    const ext = safeExtension(file.name || "photo.jpg", file.type);
    const path = `${user.id}/avatar.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(PROFILE_PHOTO_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = admin.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(path);
    const photoUrl = publicUrlData?.publicUrl || null;
    if (!photoUrl) {
      return NextResponse.json({ error: "Could not resolve uploaded image URL" }, { status: 500 });
    }

    const { error: profileError } = await admin.from("user_profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      profile_photo_url: photoUrl,
      last_updated: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("us photo POST error:", error);
    return NextResponse.json({ error: "Could not upload profile photo" }, { status: 500 });
  }
}
