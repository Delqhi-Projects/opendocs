import { createClient, RealtimeChannel, type Session } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface PresenceState {
  user_id: string;
  name: string;
  color: string;
  online_at: string;
  cursor?: { x: number; y: number };
}

/**
 * Shared channel scoped by hostname to allow collaboration between users on the same instance.
 */
export function createDocChannel(host: string = window.location.host): RealtimeChannel | null {
  if (!supabase) return null;
  const channelName = `opendocs-collaboration-${host.replace(/[^a-z0-9]/gi, '-')}`;
  return supabase.channel(channelName);
}

/**
 * Helpers for Auth
 */
export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
