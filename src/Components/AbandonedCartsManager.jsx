import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Search, ShoppingCart } from "lucide-react";

// Mirrors the stage timing in the whatsapp-agent repo's lib/abandoned-cart.ts
// - keep these two in sync if the recovery timing there ever changes.
const STAGE_DELAYS_MS = [45 * 60 * 1000, 24 * 60 * 60 * 1000, 72 * 60 * 60 * 1000];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "abandoned", label: "Awaiting next reminder" },
  { value: "converted", label: "Converted" },
  { value: "opted_out", label: "Opted out" },
  { value: "not_opted_in", label: "Never opted in" },
  { value: "fully_nudged", label: "All reminders sent" },
];

const STATUS_STYLES = {
  abandoned: "bg-amber-100 text-amber-800",
  converted: "bg-green-100 text-green-800",
  opted_out: "bg-gray-200 text-gray-700",
  not_opted_in: "bg-gray-100 text-gray-500",
  fully_nudged: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS = {
  abandoned: "Awaiting next reminder",
  converted: "Converted",
  opted_out: "Opted out",
  not_opted_in: "Never opted in",
  fully_nudged: "All reminders sent",
};

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Re-derives status the same way the recovery job in whatsapp-agent decides
// what to do next - this is read-only reporting, it never writes anything
// back, so it's safe to compute purely from what's already on the document.
function computeDerivedStatus(cart, optedOutPhones) {
  if (cart.status === "converted") return "converted";
  const tenDigit = String(cart.phone || "").replace(/\D/g, "").slice(-10);
  if (optedOutPhones.has(tenDigit)) return "opted_out";
  if (cart.marketingOptIn !== true) return "not_opted_in";
  const stage = typeof cart.whatsappStage === "number" ? cart.whatsappStage : 0;
  if (stage >= STAGE_DELAYS_MS.length) return "fully_nudged";
  return "abandoned";
}

function computeNextNotification(cart, derivedStatus) {
  if (derivedStatus !== "abandoned") return null;
  const stage = typeof cart.whatsappStage === "number" ? cart.whatsappStage : 0;
  const createdAt = toDate(cart.createdAt);
  if (!createdAt) return null;
  return new Date(createdAt.getTime() + STAGE_DELAYS_MS[stage]);
}

const AbandonedCartsManager = () => {
  const [carts, setCarts] = useState([]);
  const [optedOutPhones, setOptedOutPhones] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cartsSnap, optOutSnap] = await Promise.all([
          getDocs(collection(db, "abandoned_checkouts")),
          getDocs(collection(db, "whatsapp_opt_outs")),
        ]);
        setCarts(cartsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setOptedOutPhones(new Set(optOutSnap.docs.map((d) => d.id)));
      } catch (err) {
        console.error("Failed to load abandoned carts:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows = useMemo(() => {
    const startBound = startDate ? new Date(startDate) : null;
    const endBound = endDate ? new Date(endDate) : null;
    if (endBound) endBound.setHours(23, 59, 59, 999);
    const q = search.trim().toLowerCase();

    return carts
      .map((cart) => {
        const derivedStatus = computeDerivedStatus(cart, optedOutPhones);
        return { ...cart, derivedStatus, nextNotification: computeNextNotification(cart, derivedStatus) };
      })
      .filter((cart) => {
        const createdAt = toDate(cart.createdAt);
        if (startBound && createdAt && createdAt < startBound) return false;
        if (endBound && createdAt && createdAt > endBound) return false;
        if (statusFilter !== "all" && cart.derivedStatus !== statusFilter) return false;
        if (q) {
          const haystack = `${cart.name || ""} ${cart.phone || ""} ${cart.email || ""}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [carts, optedOutPhones, startDate, endDate, statusFilter, search]);

  const stats = useMemo(() => {
    const converted = rows.filter((r) => r.derivedStatus === "converted").length;
    const optedOut = rows.filter((r) => r.derivedStatus === "opted_out").length;
    const totalValue = rows.reduce((sum, r) => sum + (Number(r.cartTotal) || 0), 0);
    return { total: rows.length, converted, optedOut, totalValue };
  }, [rows]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading abandoned carts...</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">In range</p>
          <p className="text-lg font-bold text-gray-700">{stats.total}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Converted anyway</p>
          <p className="text-lg font-bold text-green-600">{stats.converted}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Opted out</p>
          <p className="text-lg font-bold text-gray-500">{stats.optedOut}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500">Cart value in range</p>
          <p className="text-lg font-bold text-indigo-600">₹{stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4 bg-white p-3 rounded-lg border border-gray-200">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Search name / phone / email</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-2 py-1 text-sm"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No abandoned carts match these filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Customer</th>
                <th className="text-left px-3 py-2">Cart</th>
                <th className="text-left px-3 py-2">Value</th>
                <th className="text-left px-3 py-2">Abandoned</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Reminders sent</th>
                <th className="text-left px-3 py-2">Next reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((cart) => {
                const now = new Date();
                const overdue = cart.nextNotification && cart.nextNotification < now;
                return (
                  <tr key={cart.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">{cart.name || "-"}</div>
                      <div className="text-xs text-gray-500">{cart.phone || "-"}</div>
                      <div className="text-xs text-gray-400">{cart.email || "-"}</div>
                    </td>
                    <td className="px-3 py-2">
                      {(cart.cart || []).map((item, i) => (
                        <div key={i} className="text-xs text-gray-600">
                          {item.name} {item.size ? `(${item.size})` : ""}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      ₹{Number(cart.cartTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">{formatDateTime(cart.createdAt)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_STYLES[cart.derivedStatus]}`}>
                        {STATUS_LABELS[cart.derivedStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {typeof cart.whatsappStage === "number" ? cart.whatsappStage : 0} / {STAGE_DELAYS_MS.length}
                      {cart.lastNudgedAt && <div className="text-gray-400">last: {formatDateTime(cart.lastNudgedAt)}</div>}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {cart.nextNotification ? (
                        <span className={overdue ? "text-red-600 font-medium" : "text-gray-600"}>
                          {overdue ? "Overdue: " : ""}
                          {formatDateTime(cart.nextNotification)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AbandonedCartsManager;
