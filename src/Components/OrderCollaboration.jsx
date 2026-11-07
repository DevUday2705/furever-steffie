import { useState } from "react";
import toast from "react-hot-toast";
import { adminFetch } from "../utils/adminFetch";
import { ORDER_TEAM, getOrderOwner, getStaffName } from "../../lib/orderTeam";

const formatTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// The order's owner, transfer button and shared comment thread.
const OrderCollaboration = ({ order, onUpdate }) => {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const owner = getOrderOwner(order);
  const transferTargets = ORDER_TEAM.filter((member) => member.email !== owner);
  const activity = order.orderActivity || [];

  const send = async (payload, successMessage) => {
    setBusy(true);
    try {
      const response = await adminFetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, text: draft, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Something went wrong.");

      onUpdate(order.id, result.update);
      setDraft("");
      toast.success(successMessage);
    } catch (error) {
      console.error("Order activity failed:", error);
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-2 border-t">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="font-semibold">
          💬 Comments
          <span className="font-normal text-gray-500 ml-2">
            Owner: <span className="font-semibold text-gray-800">{getStaffName(owner)}</span>
          </span>
        </p>
        {transferTargets.map((member) => (
          <button
            key={member.email}
            type="button"
            disabled={busy}
            onClick={() =>
              send(
                { action: "transfer-order", toEmail: member.email },
                `Order transferred to ${member.name}`
              )
            }
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Transfer to {member.name}
          </button>
        ))}
      </div>

      {activity.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {activity.map((entry) => (
            <li
              key={entry.id}
              className={`rounded px-2 py-1.5 ${
                entry.type === "transfer" ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-[10px] text-gray-500">
                <span className="font-semibold">{getStaffName(entry.author)}</span>
                {entry.type === "transfer" &&
                  ` transferred this from ${getStaffName(entry.from)} to ${getStaffName(entry.to)}`}
                {" · "}
                {formatTime(entry.createdAt)}
              </p>
              {entry.text && <p className="whitespace-pre-wrap mt-0.5">{entry.text}</p>}
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write a comment. If you transfer the order, this is sent with it."
        rows={2}
        maxLength={2000}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex justify-end mt-1">
        <button
          type="button"
          disabled={busy || !draft.trim()}
          onClick={() => send({ action: "add-order-comment" }, "Comment added")}
          className="text-xs px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {busy ? "Saving..." : "Add Comment"}
        </button>
      </div>
    </div>
  );
};

export default OrderCollaboration;
