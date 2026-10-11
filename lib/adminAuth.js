// Admin-only API actions need a signed-in staff member. The admin pages and
// the Steffie Admin app send the person's Supabase session token, and
// Supabase's is_admin() confirms the account is on the staff list.

const SUPABASE_URL = "https://kzhsneuyeaviatbgoprj.supabase.co";
// Publishable key - public by design; the user's own token decides access.
const SUPABASE_KEY = "sb_publishable_SAKd08Q3R2xb73t6DY7OOg_Jgefjhf5";

// Resolves true for staff. Otherwise it has already sent the 401/403 and the
// handler should just return.
export async function requireAdmin(req, res) {
    const header = req.headers?.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
        res.status(401).json({ message: "Sign in to the admin to do this." });
        return false;
    }

    try {
        const check = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: "{}",
        });
        if (check.status === 401) {
            res.status(401).json({ message: "Your admin session has expired. Sign in again." });
            return false;
        }
        if (!check.ok) throw new Error(`Supabase answered ${check.status}`);
        if ((await check.json()) !== true) {
            res.status(403).json({ message: "This account isn't on the staff list." });
            return false;
        }
        return true;
    } catch (err) {
        console.error("Admin check failed:", err);
        res.status(503).json({ message: "Couldn't check your admin sign-in. Try again." });
        return false;
    }
}
