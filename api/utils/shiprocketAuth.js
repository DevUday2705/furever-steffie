// Shiprocket auth token, cached in Firestore so we don't hit their login
// endpoint (rate-limited) on every serverless cold start.
const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // Shiprocket tokens last 10 days; refresh a day early

export async function getShiprocketToken(db) {
    const tokenRef = db.collection("settings").doc("shiprocket");
    const snap = await tokenRef.get();
    const data = snap.exists ? snap.data() : null;
    const now = Date.now();

    if (data?.token && data?.expiresAt && data.expiresAt > now) {
        return data.token;
    }

    const resp = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Shiprocket login failed: ${resp.status} ${text}`);
    }

    const json = await resp.json();
    if (!json.token) {
        throw new Error(`Shiprocket login response missing token: ${JSON.stringify(json)}`);
    }

    await tokenRef.set({ token: json.token, expiresAt: now + TOKEN_TTL_MS }, { merge: true });
    return json.token;
}

export { SHIPROCKET_BASE_URL };
