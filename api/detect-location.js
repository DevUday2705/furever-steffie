// Vercel automatically adds geolocation headers to every request at the edge
// - x-vercel-ip-country is the visitor's ISO 3166-1 alpha-2 country code.
// No third-party geo-IP service, no extra cost, no extra request latency
// beyond this one fast lookup. Note: this header is only populated on actual
// Vercel deployments, not `vite dev` locally.
export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Only GET method allowed" });
    }

    const countryCode = req.headers["x-vercel-ip-country"] || null;
    return res.status(200).json({ countryCode });
}
