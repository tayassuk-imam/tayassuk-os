import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

let supabase = null;
let initialized = false;
let initError = null;

async function ensureClient() {
  if (initialized) return supabase;
  initialized = true;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const mod = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    initError = error;
    console.warn('Supabase initialization unavailable; using local fallback.', error);
  }
  return supabase;
}

const ROW_ID = 'main';
export async function isCmsConfigured() { return Boolean(await ensureClient()); }
export async function loadRemotePortfolio() {
  const client = await ensureClient();
  if (!client) return { data: null, error: initError, configured: false };
  const { data, error } = await client.from('portfolio_content').select('data, updated_at').eq('id', ROW_ID).maybeSingle();
  if (error) return { data: null, error, configured: true };
  return { data: data?.data ?? null, updatedAt: data?.updated_at ?? null, error: null, configured: true };
}
export async function saveRemotePortfolio(payload) {
  const client = await ensureClient();
  if (!client) throw new Error('Supabase is not configured. Add the project URL and anon key once in content/supabase-config.js.');
  const { data, error } = await client.from('portfolio_content').upsert({ id: ROW_ID, data: payload, updated_at: new Date().toISOString() }).select('updated_at').single();
  if (error) throw error;
  return data;
}
export async function signIn(email, password) {
  const client = await ensureClient();
  if (!client) throw new Error('Supabase is not configured yet.');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}
export async function signUp(email, password) {
  const client = await ensureClient();
  if (!client) throw new Error('Supabase is not configured yet.');
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const client = await ensureClient();
  if (!client) return;
  await client.auth.signOut();
}
export async function getSession() {
  const client = await ensureClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session ?? null;
}
export async function currentConfigState() { await ensureClient(); return { configured: Boolean(supabase), error: initError }; }
