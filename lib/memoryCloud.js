import { supabase } from "@/lib/supabase";
import { defaultMemory } from "@/lib/defaultMemory";
import { getMemory, setMemory } from "@/lib/memory";

async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

export async function signInWithPassword(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email, password) {
  return await supabase.auth.signUp({ email, password });
}

export async function loadMemoryForCurrentUser() {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in" };

  const { data, error } = await supabase
    .from("users_memory")
    .select("memory")
    .eq("user_id", userId)
    .single();

  if (error) {
    // No row yet is normal (PostgREST returns 406 / "PGRST116" sometimes depending on config)
    return { ok: true, memory: defaultMemory, exists: false };
  }

  const memory = data?.memory ?? defaultMemory;
  return { ok: true, memory, exists: true };
}

export async function saveMemoryForCurrentUser(memoryArg) {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in" };

  const memory = memoryArg ?? getMemory() ?? defaultMemory;

  const { error } = await supabase.from("users_memory").upsert({
    user_id: userId,
    memory,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function hydrateLocalMemoryFromCloud() {
  const res = await loadMemoryForCurrentUser();
  if (!res.ok) return res;
  try {
    setMemory(res.memory ?? defaultMemory);
  } catch {}
  return { ok: true };
}

