import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Loader2, CheckCircle2, XCircle, Download } from "lucide-react";
import { downloadBlob } from "../utils/downloadBlob";

// Bulk-ship several orders at once: fetch the cheapest courier for each,
// then create each shipment one at a time (kept sequential so we don't
// slam the Shiprocket API/wallet with parallel requests), and finally offer
// one merged PDF (label + manifest + invoice, for every shipped order) to
// download in one click.

const BulkShipModal = ({ isOpen, orders, onCancel, onOrderShipped }) => {
  const [rows, setRows] = useState([]);
  const [phase, setPhase] = useState("loading"); // "loading" | "ready" | "shipping" | "done"
  const [downloadError, setDownloadError] = useState(null);
  const [downloadingIds, setDownloadingIds] = useState(null); // order.id being downloaded, or "all"

  useEffect(() => {
    if (!isOpen) return;
    setPhase("loading");
    setDownloadError(null);

    const initialRows = orders.map((order) => ({
      order,
      status: order.orderStatus === "shipped" ? "already-shipped" : "fetching",
      courier: null,
      error: null,
      trackingId: null,
      shipmentId: null,
    }));
    setRows(initialRows);

    Promise.all(
      initialRows.map(async (row, idx) => {
        if (row.status === "already-shipped") return row;

        const pincode = row.order.customer?.pincode;
        if (!pincode) {
          return { ...row, status: "error", error: "No delivery pincode on file" };
        }

        try {
          const res = await fetch("/api/shiprocket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "serviceability",
              deliveryPincode: pincode,
              items: (row.order.items || []).map((i) => ({ quantity: i.quantity || 1 })),
              codRequired: row.order.paymentMethod === "cod",
            }),
          });
          const data = await res.json();
          if (!data.success || !data.options?.length) {
            return { ...row, status: "error", error: data.message || "No couriers available" };
          }
          return { ...row, status: "ready", courier: data.options[0] };
        } catch (err) {
          return { ...row, status: "error", error: err.message };
        }
      })
    ).then((resolvedRows) => {
      setRows(resolvedRows);
      setPhase("ready");
    });
  }, [isOpen, orders]);

  if (!isOpen) return null;

  const shippableCount = rows.filter((r) => r.status === "ready").length;

  const handleShipAll = async () => {
    setPhase("shipping");

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].status !== "ready") continue;

      setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "shipping" } : r)));

      try {
        const resp = await fetch("/api/shiprocket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-order",
            orderId: rows[i].order.id,
            courierId: rows[i].courier.courierId,
          }),
        });
        const data = await resp.json();

        if (!resp.ok || !data.success) {
          setRows((prev) =>
            prev.map((r, idx) => (idx === i ? { ...r, status: "error", error: data.message || "Failed to ship" } : r))
          );
          continue;
        }

        setRows((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "shipped",
                  trackingId: data.trackingId,
                  shipmentId: data.shipmentId,
                  orderIdSR: data.shiprocketOrderId,
                }
              : r
          )
        );
        onOrderShipped?.(rows[i].order.id, { trackingId: data.trackingId, courierName: data.courierName });
      } catch (err) {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "error", error: err.message } : r)));
      }
    }

    setPhase("done");
  };

  // Downloads one merged PDF (label + manifest + invoice) covering every
  // shipment/order id passed in - Shiprocket merges multiple ids within
  // each document type, so this works the same for one order or a whole batch.
  const downloadDocuments = async (downloadKey, shipmentIds, orderIds) => {
    if (!shipmentIds.length && !orderIds.length) return;
    setDownloadError(null);
    setDownloadingIds(downloadKey);
    try {
      const res = await fetch("/api/shiprocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-documents", shipmentIds, orderIds }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDownloadError(data.message || "Failed to generate shipping documents");
        return;
      }

      const warningsHeader = res.headers.get("X-Document-Warnings");
      if (warningsHeader) {
        try {
          const warnings = JSON.parse(decodeURIComponent(warningsHeader));
          if (warnings.length) setDownloadError(`Downloaded, but missing: ${warnings.join("; ")}`);
        } catch {
          // Ignore malformed warning header - the download itself still succeeded.
        }
      }

      const blob = await res.blob();
      downloadBlob(blob, "shipping-documents.pdf");
    } catch (err) {
      console.error("Failed to generate shipping documents:", err);
      setDownloadError("Failed to generate shipping documents");
    } finally {
      setDownloadingIds(null);
    }
  };

  const handleDownloadAll = () => {
    const shipped = rows.filter((r) => r.status === "shipped");
    downloadDocuments(
      "all",
      shipped.map((r) => r.shipmentId).filter(Boolean),
      shipped.map((r) => r.orderIdSR).filter(Boolean)
    );
  };

  const statusBadge = (row) => {
    switch (row.status) {
      case "fetching":
        return <Loader2 size={14} className="animate-spin text-gray-400" />;
      case "ready":
        return <span className="text-xs text-gray-500">₹{row.courier.price}</span>;
      case "shipping":
        return <Loader2 size={14} className="animate-spin text-green-600" />;
      case "shipped":
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600" />
            <button
              type="button"
              disabled={downloadingIds !== null}
              onClick={() => downloadDocuments(row.order.id, [row.shipmentId].filter(Boolean), [row.orderIdSR].filter(Boolean))}
              className="text-[10px] px-1.5 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              title="Downloads label + manifest + invoice merged into one PDF"
            >
              {downloadingIds === row.order.id ? "..." : "Download"}
            </button>
          </div>
        );
      case "already-shipped":
        return <span className="text-xs text-gray-400">Already shipped</span>;
      case "error":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 sm:p-6 max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Truck size={20} className="text-green-600 shrink-0" /> Bulk Ship {orders.length} Order
              {orders.length > 1 ? "s" : ""}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {rows.map((row, idx) => (
              <div
                key={row.order.id}
                className={`flex items-center justify-between border rounded px-3 py-2 text-sm ${
                  row.status === "error" ? "border-red-200 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800 truncate">
                    {row.order.customer?.fullName || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.order.customer?.pincode || "no pincode"}
                    {row.status === "ready" && row.courier && ` · ${row.courier.courierName}`}
                    {row.status === "error" && ` · ${row.error}`}
                  </div>
                </div>
                <div className="shrink-0 ml-2">{statusBadge(row)}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              {phase === "done" ? "Close" : "Cancel"}
            </button>

            {phase === "ready" && (
              <button
                type="button"
                disabled={shippableCount === 0}
                onClick={handleShipAll}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Ship {shippableCount} Order{shippableCount !== 1 ? "s" : ""}
              </button>
            )}

            {phase === "done" && rows.some((r) => r.status === "shipped") && (
              <button
                type="button"
                disabled={downloadingIds !== null}
                onClick={handleDownloadAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                title="Downloads label + manifest + invoice for every shipped order, merged into one PDF"
              >
                {downloadingIds === "all" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download All Documents
              </button>
            )}
          </div>

          {downloadError && (
            <div className="mt-2 text-xs text-amber-600 text-center">{downloadError}</div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkShipModal;
