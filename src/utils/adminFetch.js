// fetch() for the admin-only API actions: adds the signed-in staff member's
// session so the endpoint can check it (lib/adminAuth.js). Supabase is loaded
// on first use, keeping it out of the shop's own pages.
export async function adminFetch(url, options = {}) {
  const { supabase } = await import("../supabase");
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(options.headers);
  if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(url, { ...options, headers });
}
