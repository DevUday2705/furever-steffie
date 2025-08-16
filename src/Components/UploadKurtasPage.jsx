import React, { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const UploadKurtasPage = () => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadProducts = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      // Update kurtas
      const kurtasSnapshot = await getDocs(collection(db, "kurtas"));

      for (const docSnapshot of kurtasSnapshot.docs) {
        const productRef = doc(db, "kurtas", docSnapshot.id);

        // Add default stock for XS, S, M
        await updateDoc(productRef, {
          "sizeStock.XS": 5, // Set default stock
          "sizeStock.S": 5,
          "sizeStock.M": 5,
        });

        console.log(`Updated ${docSnapshot.id}`);
      }

      // Repeat for other collections (lehengas, etc.)
      console.log("All products updated with stock!");
    } catch (error) {
      console.error("Error updating products:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Upload frocks to Firestore</h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        This will upload all the frocks in the array to your Firestore
        collection named <strong>frocks</strong>. Document IDs will be
        auto-generated.
      </p>
      <button
        onClick={uploadProducts}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
      >
        {isLoading ? "Uploading..." : "Upload frocks"}
      </button>
      {status && <p className="mt-6 text-lg font-medium">{status}</p>}
    </div>
  );
};

export default UploadKurtasPage;
