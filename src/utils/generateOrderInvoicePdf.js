// Generates our own branded order invoice as a PDF, entirely in the browser -
// no external API, no server round-trip, no cost. Uses pdf-lib (already a
// project dependency for merging Shiprocket documents) since it works
// isomorphically in both Node and the browser.
//
// This is intentionally separate from the Shiprocket invoice: that one is
// Shiprocket's own shipping-carrier document, keyed by their order_id. This
// one is ours - generated from the order record we actually store, available
// the moment an order exists (no shipment required), and safe to regenerate
// any number of times since nothing here calls an external, stateful API.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const BUSINESS = {
  name: "Furever Steffie",
  tagline: "Attire for your pet's wardrobe",
  addressLines: [
    "Bharat Apartment, 302, Shivsena Galli,",
    "Near Khau Galli, Bhayandar West, Mumbai, Maharashtra - 401101",
  ],
  email: "fureversteffie@gmail.com",
  phone: "+91 70422 12942",
};

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const INK = rgb(0.15, 0.15, 0.15);
const MUTED = rgb(0.45, 0.45, 0.45);
const RULE = rgb(0.82, 0.82, 0.82);

// pdf-lib's standard fonts only support WinAnsi encoding, which has no ₹
// glyph - "Rs." avoids embedding a custom font just for the currency symbol.
const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

const describeItem = (item) => {
  const parts = [];
  if (item.isRoyalSet) parts.push("Royal Set");
  else if (item.isFullSet) parts.push("Complete Set (Kurta + Dhoti)");
  else if (item.isDupattaSet) parts.push("Kurta + Dupatta");
  else if (item.category || item.subcategory) parts.push(capitalize(item.category || item.subcategory));

  if (item.isBeaded) parts.push("Beaded");
  if (item.selectedStyle === "tassels" || item.selectedStyle === "beaded-tassels") parts.push("Tassels");
  if (item.selectedDhotiDetails?.name) parts.push(`Dhoti: ${item.selectedDhotiDetails.name}`);
  if (item.selectedColor) parts.push(String(item.selectedColor));

  return parts.join(", ") || "-";
};

export async function generateOrderInvoicePdf(order) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed) => {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const draw = (str, x, yPos, size, opts = {}) => {
    page.drawText(String(str ?? ""), {
      x,
      y: yPos,
      size,
      font: opts.bold ? bold : font,
      color: opts.color || INK,
    });
  };

  const drawRight = (str, rightX, yPos, size, opts = {}) => {
    const useFont = opts.bold ? bold : font;
    const width = useFont.widthOfTextAtSize(String(str ?? ""), size);
    draw(str, rightX - width, yPos, size, opts);
  };

  // Shortens text (with an ellipsis) until it actually fits maxWidth, measured
  // against the real font metrics rather than guessing a character count -
  // column widths vary per string since Helvetica isn't monospace.
  const truncateToWidth = (str, useFont, size, maxWidth) => {
    const text = String(str ?? "");
    if (useFont.widthOfTextAtSize(text, size) <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1 && useFont.widthOfTextAtSize(`${truncated}...`, size) > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return `${truncated}...`;
  };

  const hr = (yPos, color = RULE) => {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness: 0.75,
      color,
    });
  };

  const rightEdge = PAGE_WIDTH - MARGIN;

  // ---- Header: business on the left, "INVOICE" + order info on the right ----
  draw(BUSINESS.name, MARGIN, y, 20, { bold: true });
  drawRight("INVOICE", rightEdge, y, 20, { bold: true });
  y -= 16;
  draw(BUSINESS.tagline, MARGIN, y, 9, { color: MUTED });
  y -= 14;
  BUSINESS.addressLines.forEach((line) => {
    draw(line, MARGIN, y, 9, { color: MUTED });
    y -= 12;
  });
  draw(`${BUSINESS.email}  |  ${BUSINESS.phone}`, MARGIN, y, 9, { color: MUTED });

  // Order meta, right-aligned, starting at the same height as the address block
  let metaY = PAGE_HEIGHT - MARGIN - 16 - 14;
  drawRight(`Invoice / Order No: ${order.orderNumber || order.id || "-"}`, rightEdge, metaY, 10);
  metaY -= 14;
  drawRight(`Order Date: ${formatDate(order.createdAt)}`, rightEdge, metaY, 10);
  metaY -= 14;
  drawRight(`Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Online)"}`, rightEdge, metaY, 10);
  metaY -= 14;
  drawRight(`Status: ${(order.paymentStatus || "-").replace(/_/g, " ")}`, rightEdge, metaY, 10);

  y = Math.min(y, metaY) - 24;
  hr(y);
  y -= 24;

  // ---- Bill To ----
  const customer = order.customer || {};
  draw("BILL TO", MARGIN, y, 9, { bold: true, color: MUTED });
  y -= 14;
  draw(customer.fullName || "Customer", MARGIN, y, 11, { bold: true });
  y -= 14;
  if (customer.addressLine1) {
    draw(customer.addressLine1, MARGIN, y, 9.5);
    y -= 12;
  }
  if (customer.addressLine2) {
    draw(customer.addressLine2, MARGIN, y, 9.5);
    y -= 12;
  }
  const cityLine = [customer.city, customer.state, customer.pincode].filter(Boolean).join(", ");
  if (cityLine) {
    draw(cityLine, MARGIN, y, 9.5);
    y -= 12;
  }
  if (customer.country && customer.country.toLowerCase() !== "india") {
    draw(customer.country, MARGIN, y, 9.5);
    y -= 12;
  }
  if (customer.mobileNumber) {
    draw(`Phone: ${customer.mobileNumber}`, MARGIN, y, 9.5);
    y -= 12;
  }
  if (customer.email) {
    draw(`Email: ${customer.email}`, MARGIN, y, 9.5);
    y -= 12;
  }

  y -= 12;

  // ---- Line items table ----
  const col = {
    item: MARGIN,
    details: MARGIN + 150,
    size: MARGIN + 330,
    qty: MARGIN + 375,
    price: MARGIN + 415,
    total: rightEdge,
  };

  const drawTableHeader = () => {
    draw("ITEM", col.item, y, 9, { bold: true, color: MUTED });
    draw("DETAILS", col.details, y, 9, { bold: true, color: MUTED });
    draw("SIZE", col.size, y, 9, { bold: true, color: MUTED });
    draw("QTY", col.qty, y, 9, { bold: true, color: MUTED });
    drawRight("PRICE", col.price + 35, y, 9, { bold: true, color: MUTED });
    drawRight("TOTAL", col.total, y, 9, { bold: true, color: MUTED });
    y -= 8;
    hr(y);
    y -= 16;
  };

  ensureSpace(80);
  drawTableHeader();

  const items = order.items || [];
  let itemsSubtotal = 0;

  items.forEach((item) => {
    const qty = item.quantity || 1;
    const lineTotal = (item.price || 0) * qty;
    itemsSubtotal += lineTotal;

    ensureSpace(34);

    const itemName = truncateToWidth(item.name || "Item", bold, 9.5, col.details - col.item - 8);
    draw(itemName, col.item, y, 9.5, { bold: true });
    const details = truncateToWidth(describeItem(item), font, 8.5, col.size - col.details - 8);
    draw(details, col.details, y, 8.5, { color: MUTED });
    draw(item.selectedSize || "-", col.size, y, 9.5);
    draw(String(qty), col.qty, y, 9.5);
    drawRight(formatMoney(item.price), col.price + 35, y, 9.5);
    drawRight(formatMoney(lineTotal), col.total, y, 9.5, { bold: true });

    y -= 20;
  });

  hr(y);
  y -= 20;

  // ---- Totals ----
  // Wide enough that the longest label ("Advance Paid (non-refundable)")
  // never runs into the right-aligned value next to it.
  const totalsX = col.total - 260;
  const amount = order.amount || 0;
  const adjustment = Math.round((amount - itemsSubtotal) * 100) / 100;

  draw("Items Subtotal", totalsX, y, 10, { color: MUTED });
  drawRight(formatMoney(itemsSubtotal), col.total, y, 10);
  y -= 16;

  // Delivery/discount/fees aren't stored as separate fields on the order,
  // only the final charged amount is - show the net adjustment rather than
  // inventing a breakdown we can't actually verify.
  if (Math.abs(adjustment) >= 1) {
    draw(adjustment > 0 ? "Delivery, Fees & Adjustments" : "Discount & Adjustments", totalsX, y, 10, { color: MUTED });
    drawRight(`${adjustment > 0 ? "+" : "-"} ${formatMoney(Math.abs(adjustment))}`, col.total, y, 10);
    y -= 16;
  }

  hr(y, INK);
  y -= 18;
  draw("Total Amount", totalsX, y, 12, { bold: true });
  drawRight(formatMoney(amount), col.total, y, 12, { bold: true });
  y -= 20;

  if (order.paymentMethod === "cod") {
    draw("Advance Paid (non-refundable)", totalsX, y, 9.5, { color: MUTED });
    drawRight(formatMoney(order.codAdvanceAmount), col.total, y, 9.5);
    y -= 14;
    draw("Balance Due on Delivery", totalsX, y, 9.5, { color: MUTED, bold: true });
    drawRight(formatMoney(order.codAmountDue), col.total, y, 9.5, { bold: true });
    y -= 14;
  } else if (order.razorpay_payment_id) {
    draw(`Paid in full - Ref: ${order.razorpay_payment_id}`, totalsX, y, 8.5, { color: MUTED });
    y -= 14;
  }

  // ---- Footer ----
  ensureSpace(40);
  y = Math.min(y, MARGIN + 40);
  hr(y);
  y -= 16;
  draw("Thank you for shopping with Furever Steffie!", MARGIN, y, 9, { color: MUTED });
  y -= 12;
  draw(`Questions about this order? ${BUSINESS.email} | ${BUSINESS.phone}`, MARGIN, y, 8.5, { color: MUTED });

  return pdfDoc.save();
}
