import React, { useContext, useRef } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { traditionalOptions } from "../constants/constant";
import { toPng } from "html-to-image";
import confetti from "../../public/animation/confetti.json";
import { Link, useParams } from "react-router-dom";
import Lottie from "react-lottie";

const FinalReceipt = () => {
  const { selections } = useAppContext();
  const receiptRef = useRef(null);
  const { id } = useParams();

  const product = traditionalOptions.find((p) => p.id == selections.id);

  const handlePrint = () => {
    if (receiptRef.current) {
      toPng(receiptRef.current, {
        cacheBust: true,
        filter: (node) => {
          // Ensure nodes with the "exclude" class are excluded
          return !node.classList || !node.classList.contains("exclude");
        },
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "receipt.png";
          link.click();
        })
        .catch((error) => {
          console.error("Error generating image:", error);
        });
    }
  };

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: confetti,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      ref={receiptRef}
      className="border my-10 relative border-gray-300 rounded-lg p-4 max-w-md mx-auto bg-white shadow-md"
    >
      <div className="absolute -left-5 ">
        <Lottie options={defaultOptions} height={400} width={400} />
      </div>
      <h1 className="text-lg flex items-center justify-between font-bold uppercase text-center border-b pb-2 mb-4">
        <span>Customer Receipt</span>
        <span>1</span>
      </h1>
      <div></div>
      <h1 className="mb-5 text-lg font-medium">Customer Details</h1>
      <div className="grid text-sm text-slate-800 grid-cols-[150px_auto] gap-y-2 ">
        <h1 className="font-medium">Name:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.fullName}
        </h1>

        <h1 className="font-medium">Address:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.address}
        </h1>

        <h1 className="font-medium">Number:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.number}
        </h1>

        <h1 className="font-medium">Alternate Number:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.alternateNumber}
        </h1>
        <h1 className="font-medium">Ordered On:</h1>

        <h1 className="font-semibold text-slate-800">
          {new Date()
            .toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour12: false,
            })
            .replace(",", "")}
        </h1>
        <h1 className="font-medium">Expected Delivery:</h1>

        <h1 className="font-semibold text-red-600">
          {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleString(
            "en-IN",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          )}
        </h1>
      </div>
      <h1 className="my-5 text-lg font-medium">Pet Measurements</h1>
      <div className="grid text-sm text-slate-800 grid-cols-[150px_auto] gap-y-2 pb-5 border-b">
        <h1 className="font-medium">Neck:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.neck} Inches
        </h1>

        <h1 className="font-medium">Chest:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.chest} Inches
        </h1>

        <h1 className="font-medium">Length:</h1>
        <h1 className="font-semibold text-slate-800">
          {selections.customerData.length} Inches
        </h1>
      </div>

      <div className="flex my-2 mt-5 items-start gap-5">
        <img
          className="w-24 rounded-md"
          src={selections?.variant?.image}
          alt={product?.variant?.name}
        />
        <div>
          <p className="text-slate-800 font-medium">
            {selections?.variant?.name}
          </p>
          <p className="text-slate-800 font-medium">{selections?.size}</p>
          <p className="font-medium text-green-600">Rs.{selections?.price}/-</p>
        </div>
      </div>

      <div className="bg-amber-100 mt-2 text-sm p-2 rounded-md text-slate-800">
        <p className="font-medium mb-1">Important Information About Delivery</p>
        <p>
          You can expect to get your order stitched and delivered within 5-6
          days after payment.
        </p>
      </div>
      <h1 className="mt-2 flex items-center">
        Need help? Drop me a message on Whatsapp{" "}
        <a
          href="https://wa.me/918828145667"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center cursor-pointer shrink-0 justify-center w-8 h-8 rounded-full hover:bg-green-600 transition-colors"
        >
          <img src="/images/wa.png" className="h-10 w-full shrink-0" />
        </a>
      </h1>
      <button
        onClick={handlePrint}
        className="w-full py-3 exclude cursor-pointer bg-black text-xl mt-5 text-white rounded-md"
      >
        Print
      </button>
    </div>
  );
};

export default FinalReceipt;
