import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { msUntilCutoff, nextDispatch } from "../../utils/dispatchSchedule";

const formatLeft = (ms) => {
  const totalMins = Math.max(1, Math.ceil(ms / 60000));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (!hrs) return `${mins} min${mins === 1 ? "" : "s"}`;
  return `${hrs} hr${hrs === 1 ? "" : "s"}${mins ? ` ${mins} min${mins === 1 ? "" : "s"}` : ""}`;
};

// "Order within 1 hr 40 mins for dispatch tomorrow" - counts down to the
// real daily cutoff (utils/dispatchSchedule), only in the final stretch
// before it. Renders nothing the rest of the day.
const DispatchCountdown = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const left = msUntilCutoff(now);
  if (left === null) return null;

  const { daysFromToday, weekday } = nextDispatch(now);
  const when = daysFromToday === 1 ? "tomorrow" : `on ${weekday}`;

  return (
    <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
      <Clock size={14} className="shrink-0" />
      <span>
        Order within <span className="font-semibold">{formatLeft(left)}</span> for dispatch {when}
      </span>
    </div>
  );
};

export default DispatchCountdown;
