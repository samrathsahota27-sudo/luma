import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { SharedCoupleResultView, type SharedCouplePayload } from "@/components/SharedCoupleResultView";

async function loadShared(id: string): Promise<SharedCouplePayload | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const supabase = createClient(url, anon);
  const { data, error } = await supabase
    .from("shared_results")
    .select("result_json, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data?.result_json) return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;

  return data.result_json as SharedCouplePayload;
}

type Props = { params: Promise<{ id: string }> };

export default async function SharedCoupleResultPage({ params }: Props) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const payload = await loadShared(id);
  if (!payload) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <SharedCoupleResultView data={payload} readOnlyBanner />
      <Footer />
    </div>
  );
}
