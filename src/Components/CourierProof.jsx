import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadToImageKit } from "../constants/uploadToImageKit";
import { shrinkPhoto } from "../utils/shrinkPhoto";
import { getStaffName } from "../../lib/orderTeam";

// ImageKit resizes on the fly, so the card loads a tiny thumbnail.
const thumbnail = (url) => `${url}${url.includes("?") ? "&" : "?"}tr=w-120,h-120`;

const formatTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// Proof that a parcel went out with a non-Shiprocket courier: the photo the
// courier sends back, saved on the order with who uploaded it and when.
const CourierProof = ({ order, staffEmail, onUpdate }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const proofs = order.courierProofs || [];

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same photo be picked again after an error
    if (!file) return;

    setUploading(true);
    try {
      const photo = await shrinkPhoto(file);
      const url = await uploadToImageKit(photo, {
        folder: "courier-proofs",
        fileName: `order-${order.orderNumber || order.id}.jpg`,
      });
      const proof = { url, uploadedAt: new Date().toISOString(), uploadedBy: staffEmail || null };
      await updateDoc(doc(db, "orders", order.id), { courierProofs: arrayUnion(proof) });
      onUpdate(order.id, { courierProofs: [...proofs, proof] });
      toast.success(`Courier photo saved (${Math.round(photo.size / 1024)} KB)`);
    } catch (error) {
      console.error("Courier photo upload failed:", error);
      toast.error(error.message || "Couldn't save the photo. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (proof) => {
    if (!window.confirm("Remove this courier photo from the order?")) return;
    try {
      await updateDoc(doc(db, "orders", order.id), { courierProofs: arrayRemove(proof) });
      onUpdate(order.id, { courierProofs: proofs.filter((p) => p.url !== proof.url) });
      toast.success("Photo removed");
    } catch (error) {
      console.error("Courier photo removal failed:", error);
      toast.error("Couldn't remove the photo. Try again.");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
        title="Save the courier's photo as proof this parcel was sent"
      >
        {uploading ? "Uploading..." : proofs.length ? "📷 Add photo" : "📷 Courier photo"}
      </button>

      {proofs.map((proof) => (
        <div key={proof.url} className="relative">
          <a
            href={proof.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Uploaded ${formatTime(proof.uploadedAt)}${
              proof.uploadedBy ? ` by ${getStaffName(proof.uploadedBy)}` : ""
            }`}
          >
            <img
              src={thumbnail(proof.url)}
              alt="Courier proof"
              className="w-10 h-10 rounded object-cover border border-gray-300"
            />
          </a>
          <button
            type="button"
            onClick={() => handleRemove(proof)}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-none"
            aria-label="Remove courier photo"
          >
            ×
          </button>
          <p className="text-[9px] text-gray-500 text-center">{formatTime(proof.uploadedAt)}</p>
        </div>
      ))}
    </div>
  );
};

export default CourierProof;
