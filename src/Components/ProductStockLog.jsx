import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import toast from "react-hot-toast";
import { CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { db } from "../firebase";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL", "8XL"];

const timeRemaining = (expiresAt) => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expiring soon";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return hours >= 1 ? `${hours}h ${mins}m left` : `${mins}m left`;
};

const formatWhen = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Turns one ledger row into the plain-English trail line the size log is
// meant to read like - "who did what, when" rather than raw field names.
const describeEntry = (entry) => {
  const qty = Math.abs(entry.change);
  const when = formatWhen(entry.createdAt);

  switch (entry.reason) {
    case "admin_stock_set":
      return {
        headline: `Admin set ${entry.size} stock to ${entry.newStock} (was ${entry.previousStock})`,
        sub: when,
      };
    case "order":
    case "order_backfill":
      return {
        headline: `${entry.customerName || "Customer"}${entry.customerPhone ? ` (${entry.customerPhone})` : ""} ordered ${qty} × ${entry.size}`,
        sub: `${when}${entry.orderNumber ? ` · Order ${entry.orderNumber}` : ""}${
          entry.reason === "order_backfill" ? " · historical record" : ""
        }${entry.previousStock != null ? ` · stock ${entry.previousStock} → ${entry.newStock}` : ""}`,
      };
    case "order_cancelled":
      return {
        headline: `Order ${entry.orderNumber || ""} cancelled - ${qty} × ${entry.size} restored to stock`,
        sub: `${when} · stock ${entry.previousStock} → ${entry.newStock}`,
      };
    case "order_rollback":
      return {
        headline: `Order failed partway through - ${qty} × ${entry.size} rolled back`,
        sub: `${when}${entry.note ? ` · ${entry.note}` : ""}`,
      };
    case "reservation":
      return {
        headline: `Reserved ${qty} × ${entry.size} for ${entry.customerName || "a customer"}`,
        sub: `${when}${entry.note ? ` · ${entry.note}` : ""}`,
      };
    case "reservation_released":
      return {
        headline: `Reservation for ${entry.customerName || "a customer"} released - ${qty} × ${entry.size} back in stock`,
        sub: when,
      };
    case "reservation_expired":
      return {
        headline: `Reservation for ${entry.customerName || "a customer"} auto-expired - ${qty} × ${entry.size} released back`,
        sub: when,
      };
    default:
      return { headline: `${entry.change > 0 ? "+" : ""}${entry.change} × ${entry.size} (${entry.reason})`, sub: when };
  }
};

const ProductStockLog = ({ category, productId, productName, currentSizeStock }) => {
  const collectionName = category.endsWith("s") ? category : `${category}s`;

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [sizeFilter, setSizeFilter] = useState("all");

  const [reservations, setReservations] = useState([]);
  const [actingReservationId, setActingReservationId] = useState(null);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [holdHours, setHoldHours] = useState(24);
  const [submitting, setSubmitting] = useState(false);

  // Full trail for this product only, newest first. Sorted client-side
  // (rather than an orderBy alongside the where()) so this doesn't need a
  // manually-created Firestore composite index to work.
  useEffect(() => {
    setLoadingEntries(true);
    const unsub = onSnapshot(
      query(collection(db, "stockLedger"), where("productId", "==", productId), limit(300)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEntries(rows);
        setLoadingEntries(false);
      },
      (error) => {
        console.error("Failed to load stock log:", error);
        setLoadingEntries(false);
      }
    );
    return () => unsub();
  }, [productId]);

  // Reservations for this product only.
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "reservations"), where("productId", "==", productId)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt));
        setReservations(rows);
      },
      (error) => console.error("Failed to load reservations:", error)
    );
    return () => unsub();
  }, [productId]);

  const filteredEntries = useMemo(
    () => (sizeFilter === "all" ? entries : entries.filter((e) => e.size === sizeFilter)),
    [entries, sizeFilter]
  );

  const activeReservations = reservations.filter((r) => r.status === "active");

  const handleReserve = async () => {
    if (!size) return toast.error("Pick a size");
    if (!customerName.trim()) return toast.error("Enter the customer's name");
    if (quantity < 1) return toast.error("Quantity must be at least 1");

    setSubmitting(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reserve",
          productId,
          category: collectionName,
          size,
          quantity: Number(quantity),
          customerName,
          notes,
          holdHours: Number(holdHours),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to reserve stock");
        return;
      }
      toast.success(`Reserved ${quantity} × ${size} for ${customerName}`);
      setSize("");
      setQuantity(1);
      setCustomerName("");
      setNotes("");
      setHoldHours(24);
    } catch (error) {
      console.error("Reserve failed:", error);
      toast.error("Failed to reserve stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (reservationId, action, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setActingReservationId(reservationId);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reservationId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Action failed");
        return;
      }
      toast.success(action === "release-reservation" ? "Stock released back" : "Marked as converted");
    } catch (error) {
      console.error(`${action} failed:`, error);
      toast.error("Action failed");
    } finally {
      setActingReservationId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reserve */}
      <div className="border rounded-lg p-4 bg-indigo-50/50">
        <h3 className="font-semibold text-sm mb-3">Reserve {productName || "this product"} for a customer</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">Select size</option>
              {ALL_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} ({currentSizeStock?.[s] || 0} in stock)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Hold (hours)</label>
            <input
              type="number"
              min="1"
              value={holdHours}
              onChange={(e) => setHoldHours(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Who is this for?"
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. WhatsApp chat 15 Sept"
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleReserve}
          disabled={submitting}
          className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Reserving..." : "Reserve"}
        </button>
      </div>

      {/* Active reservations for this product */}
      {activeReservations.length > 0 && (
        <div className="border rounded-lg p-4 bg-amber-50">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Active reservations
          </h3>
          <div className="space-y-2">
            {activeReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-white border border-amber-200 rounded px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {r.quantity} × {r.size} for {r.customerName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{r.notes}</div>
                </div>
                <span className="text-xs text-amber-700 font-medium shrink-0">{timeRemaining(r.expiresAt)}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={actingReservationId === r.id}
                    onClick={() => handleAction(r.id, "convert-reservation")}
                    title="Customer bought it"
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={actingReservationId === r.id}
                    onClick={() => handleAction(r.id, "release-reservation", `Release ${r.quantity} × ${r.size} back to stock?`)}
                    title="Release back to stock"
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The trail */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Stock trail</h3>
          <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="all">All sizes</option>
            {ALL_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loadingEntries ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-sm text-gray-500">
            No stock changes logged yet for {sizeFilter === "all" ? "this product" : `size ${sizeFilter}`}.
          </p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredEntries.map((entry) => {
              const { headline, sub } = describeEntry(entry);
              return (
                <div key={entry.id} className="flex items-start gap-2 text-sm border-b last:border-b-0 pb-2">
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${entry.change < 0 ? "bg-red-500" : "bg-green-500"}`}
                  />
                  <div className="min-w-0">
                    <div className="text-gray-800">{headline}</div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStockLog;
