import { supabase } from "@/lib/supabase";

/**
 * Browser auth client accessor.
 * We intentionally return the shared singleton to avoid multiple GoTrueClient
 * instances competing for the same localStorage auth key.
 */
export const createClient = () => supabase;
