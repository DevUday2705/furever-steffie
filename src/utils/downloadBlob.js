// Triggers a browser file download for a Blob (or raw bytes) via a
// temporary, invisible <a download> link - the standard way to save
// client-generated or fetched binary data without a server round-trip.
export const downloadBlob = (data, filename) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
