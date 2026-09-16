import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PackageCheck,
  Search,
  Clock,
  CheckCircle2,
  RotateCcw,
  History,
} from "lucide-react";
import { collection, getDocs, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase";

// Same product collections order-creation and the stock ledger both know
// about - kept here too since lib/stockLedger.js uses firebase-admin and
// can't be imported into browser code.
const PRODUCT_COLLECTIONS = [
  "kurtas",
  "pathanis",
  "lehengas",
  "frocks",
  "bandanas",
  "bowties",
  "tuts",
  "tuxedos",
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL", "8XL"];

const REASON_LABELS = {
  order: "Order placed",
  order_rollback: "Order rolled back",
  order_cancelled: "Order cancelled",
  reservation: "Reserved",
  reservation_released: "Reservation released",
  reservation_expired: "Reservation expired",
};

const timeRemaining = (expiresAt) => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expiring soon";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 1) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
};

const StockReservations = () => {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [holdHours, setHoldHours] = useState(24);
  const [submitting, setSubmitting] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [actingReservationId, setActingReservationId] = useState(null);

  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerFilter, setLedgerFilter] = useState("");

  // Load every product once (small catalog) so admin can search-as-you-type
  // and see live per-size stock while picking what to reserve.
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const results = await Promise.all(
          PRODUCT_COLLECTIONS.map(async (collectionName) => {
            const snap = await getDocs(collection(db, collectionName));
            return snap.docs.map((d) => ({
              id: d.id,
              collectionName,
              name: d.data().name || d.id,
              mainImage: d.data().mainImage || null,
              sizeStock: d.data().sizeStock || {},
            }));
          })
        );
        setAllProducts(results.flat());
      } catch (error) {
        console.error("Failed to load products for reservation picker:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Live reservation list.
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "reservations"), orderBy("reservedAt", "desc"), limit(100)),
      (snap) => setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (error) => console.error("Failed to load reservations:", error)
    );
    return () => unsub();
  }, []);

  // Ledger is a plain read (not live) - a manual refresh button covers the
  // "did my last action log correctly" check without an always-on listener.
  const loadLedger = async () => {
    setLedgerLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "stockLedger"), orderBy("createdAt", "desc"), limit(200)));
      setLedger(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Failed to load stock ledger:", error);
    } finally {
      setLedgerLoading(false);
    }
  };
  useEffect(() => {
    loadLedger();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return allProducts.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 15);
  }, [productSearch, allProducts]);

  const resetForm = () => {
    setSelectedProduct(null);
    setProductSearch("");
    setSize("");
    setQuantity(1);
    setCustomerName("");
    setNotes("");
    setHoldHours(24);
  };

  const handleReserve = async () => {
    if (!selectedProduct) return toast.error("Pick a product first");
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
          productId: selectedProduct.id,
          category: selectedProduct.collectionName,
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
      toast.success(`Reserved ${quantity} × ${selectedProduct.name} (${size}) for ${customerName}`);
      resetForm();
      loadLedger();
      // Reflect the new stock immediately in the picker without a full reload.
      setAllProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, sizeStock: { ...p.sizeStock, [size]: data.newStock } }
            : p
        )
      );
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
      loadLedger();
    } catch (error) {
      console.error(`${action} failed:`, error);
      toast.error("Action failed");
    } finally {
      setActingReservationId(null);
    }
  };

  const visibleReservations = showAllReservations
    ? reservations
    : reservations.filter((r) => r.status === "active");

  const filteredLedger = ledger.filter((entry) => {
    if (!ledgerFilter.trim()) return true;
    const q = ledgerFilter.toLowerCase();
    return (
      entry.productName?.toLowerCase().includes(q) ||
      entry.orderNumber?.toLowerCase().includes(q) ||
      entry.customerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PackageCheck className="h-6 w-6" />
              Stock &amp; Reservations
            </h1>
            <p className="text-gray-600 text-sm">
              Hold stock for a customer, release it back, and see exactly why any product's stock changed.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Reserve Stock */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reserve Stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
              {selectedProduct ? (
                <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-gray-50">
                  <span className="text-sm font-medium text-gray-800 truncate">{selectedProduct.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={loadingProducts ? "Loading products..." : "Search product by name..."}
                      disabled={loadingProducts}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {filteredProducts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredProducts.map((p) => (
                        <button
                          key={`${p.collectionName}-${p.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductSearch("");
                            setSize("");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left border-b last:border-b-0"
                        >
                          {p.mainImage && (
                            <img src={p.mainImage} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                          )}
                          <span className="text-sm text-gray-800 truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-400 ml-auto shrink-0">{p.collectionName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                disabled={!selectedProduct}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              >
                <option value="">Select size</option>
                {ALL_SIZES.map((s) => (
                  <option key={s} value={s} disabled={!selectedProduct}>
                    {s} {selectedProduct ? `(${selectedProduct.sizeStock?.[s] || 0} in stock)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hold duration (hours)</label>
              <input
                type="number"
                min="1"
                value={holdHours}
                onChange={(e) => setHoldHours(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Defaults to 24h - auto-releases if forgotten.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Who is this being held for?"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. WhatsApp chat 15 Sept, will order by tomorrow"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleReserve}
            disabled={submitting}
            className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Reserving..." : "Reserve Outfit"}
          </button>
        </div>

        {/* Active Reservations */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reservations
            </h2>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showAllReservations}
                onChange={(e) => setShowAllReservations(e.target.checked)}
              />
              Show released/expired/converted too
            </label>
          </div>

          {visibleReservations.length === 0 ? (
            <p className="text-sm text-gray-500">No {showAllReservations ? "" : "active "}reservations.</p>
          ) : (
            <div className="space-y-2">
              {visibleReservations.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-3 text-sm ${
                    r.status === "active" ? "border-amber-200 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 truncate">
                      {r.quantity} × {r.productName} ({r.size})
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      For {r.customerName} {r.notes && `· ${r.notes}`}
                    </div>
                  </div>
                  <div className="text-xs text-right shrink-0">
                    {r.status === "active" ? (
                      <span className="text-amber-700 font-medium">{timeRemaining(r.expiresAt)}</span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          r.status === "converted"
                            ? "bg-green-100 text-green-700"
                            : r.status === "expired"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    )}
                  </div>
                  {r.status === "active" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={actingReservationId === r.id}
                        onClick={() => handleAction(r.id, "convert-reservation")}
                        title="Customer bought it - close this out without touching stock again"
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={actingReservationId === r.id}
                        onClick={() =>
                          handleAction(
                            r.id,
                            "release-reservation",
                            `Release ${r.quantity} × ${r.productName} (${r.size}) back to stock?`
                          )
                        }
                        title="Customer didn't take it - release stock back"
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Ledger */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              Stock Log
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ledgerFilter}
                onChange={(e) => setLedgerFilter(e.target.value)}
                placeholder="Filter by product, order # or customer..."
                className="border rounded-lg px-3 py-1.5 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={loadLedger}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {ledgerLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : filteredLedger.length === 0 ? (
            <p className="text-sm text-gray-500">No stock changes logged yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="px-2 py-2 font-medium">When</th>
                    <th className="px-2 py-2 font-medium">Product</th>
                    <th className="px-2 py-2 font-medium">Size</th>
                    <th className="px-2 py-2 font-medium">Change</th>
                    <th className="px-2 py-2 font-medium">Reason</th>
                    <th className="px-2 py-2 font-medium">Order / Customer</th>
                    <th className="px-2 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 max-w-[160px] truncate" title={entry.productName}>
                        {entry.productName}
                        {entry.kind === "dhoti" && <span className="text-gray-400"> (dhoti)</span>}
                      </td>
                      <td className="px-2 py-2">{entry.size}</td>
                      <td className={`px-2 py-2 font-medium ${entry.change < 0 ? "text-red-600" : "text-green-600"}`}>
                        {entry.change > 0 ? "+" : ""}
                        {entry.change}
                        <span className="text-gray-400 font-normal"> ({entry.previousStock}→{entry.newStock})</span>
                      </td>
                      <td className="px-2 py-2">{REASON_LABELS[entry.reason] || entry.reason}</td>
                      <td className="px-2 py-2 max-w-[140px] truncate">
                        {entry.orderNumber || entry.customerName || "-"}
                      </td>
                      <td className="px-2 py-2 max-w-[180px] truncate text-gray-500" title={entry.note}>
                        {entry.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockReservations;
