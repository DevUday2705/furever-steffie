import { createClient } from "@supabase/supabase-js";

// Staff sign-in for the admin pages - the same Supabase project and accounts
// as the Steffie Admin app. The publishable key is meant to be public:
// row-level security decides what a signed-in account can see.
export const supabase = createClient(
  "https://kzhsneuyeaviatbgoprj.supabase.co",
  "sb_publishable_SAKd08Q3R2xb73t6DY7OOg_Jgefjhf5",
  { auth: { storageKey: "furever-steffie-admin" } }
);
