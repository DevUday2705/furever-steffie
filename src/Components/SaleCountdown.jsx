import { useEffect, useState } from "react";
import { Tag } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Counts down to the next midnight IST and starts over, so every visitor
// sees the same clock and it never sits at 00:00:00 between sale days.
const msUntilMidnightIST = () => {
  const istNow = Date.now() + IST_OFFSET_MS;
  return DAY_MS - (istNow % DAY_MS);
};

const pad = (n) => String(n).padStart(2, "0");

const SaleCountdown = () => {
  const [remaining, setRemaining] = useState(msUntilMidnightIST);

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilMidnightIST()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      style={{ background: "linear-gradient(90deg, #e53935, #c62828)" }}
      // Breaks out of any padded parent so the strip runs edge to edge.
      className="text-white mt-3 mx-[calc(50%-50vw)] w-screen"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Tag size={16} className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">
              Diwali Stock Clearance Sale
            </p>
            <p className="text-[11px] text-white/85 leading-tight">
              Ends in
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono flex-shrink-0">
          {[hours, minutes, seconds].map((value, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="font-semibold">:</span>}
              <span className="bg-white/20 rounded px-1.5 py-0.5 text-sm font-semibold tabular-nums">
                {pad(value)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaleCountdown;
