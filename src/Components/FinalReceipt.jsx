import React, { useContext, useRef } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { traditionalOptions } from "../constants/constant";
import { toPng } from "html-to-image";
import confetti from "../../public/animation/confetti.json";
import { useParams } from "react-router-dom";
import Lottie from "react-lottie";
const FinalReceipt = () => {
  const { selections } = useAppContext();
  const receiptRef = useRef(null);
  const { id } = useParams();

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
  console.log(selections);
  const fabric = traditionalOptions.filter(
    (item) => item.id == selections.id
  )[0];
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
      <h1 className="text-lg font-semibold text-center border-b pb-2 mb-4">
        Customer Receipt
      </h1>
      <h1 className="mb-5 text-lg font-medium">Customer Details</h1>
      <div className="grid text-sm text-slate-800 grid-cols-[150px_auto] gap-y-2">
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
      </div>
      <h1 className="my-5 text-lg font-medium">Pet Measurements</h1>
      <div className="grid text-sm text-slate-800 grid-cols-[150px_auto] gap-y-2">
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
      <h1 className="my-5 text-lg font-medium">Fabric/Design Details</h1>
      {selections?.cart?.map((fabric) => (
        <div className="flex mb-2 items-start gap-5">
          <img className="w-24 rounded-md" src={fabric.img} alt={fabric.name} />
          <div>
            <p className="text-slate-800 font-medium">{fabric.name}</p>
            <p className="font-medium text-green-600">Rs.{fabric.price}/-</p>
          </div>
        </div>
      ))}
      <div className="bg-amber-100 mt-2 text-sm p-2 rounded-md text-slate-800">
        <p className="font-medium mb-1">Important Information About Delivery</p>
        <p>
          Once the order is placed, The outfit gets stitched within a day or two
          and then dispatched to courier services, It usually gets delivered
          within 2-3 days all over India. So, you can expect to get the order
          delivered within 5-6 days (Stitching + Shipping) after the payment is
          made.
        </p>
      </div>

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
