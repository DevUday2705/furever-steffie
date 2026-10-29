// Real dispatch schedule - drives both the delivery estimate and the
// "order within X for dispatch tomorrow" countdown. The countdown is only
// honest because this cutoff is the one the warehouse actually works to;
// change it here if that changes (a fake/resetting timer is "false urgency"
// under India's 2023 dark-pattern guidelines).
//  - orders placed before 10 PM IST go out the next dispatch day
//  - no courier pickup on Sundays
export const DISPATCH_CUTOFF_HOUR_IST = 22;
const NO_DISPATCH_WEEKDAYS = [0]; // Sunday
// Countdown only shows in this final stretch before the cutoff.
export const COUNTDOWN_WINDOW_MS = 3 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// IST wall-clock as a Date whose UTC fields read as IST.
const istClock = (nowMs) => new Date(nowMs + IST_OFFSET_MS);

// Whole days from today (IST) to the next dispatch, and that day's weekday.
export function nextDispatch(nowMs = Date.now()) {
  const ist = istClock(nowMs);
  let offset = ist.getUTCHours() < DISPATCH_CUTOFF_HOUR_IST ? 1 : 2;
  while (NO_DISPATCH_WEEKDAYS.includes(new Date(ist.getTime() + offset * DAY_MS).getUTCDay())) {
    offset += 1;
  }
  const weekday = new Date(ist.getTime() + offset * DAY_MS).toLocaleDateString("en-IN", {
    weekday: "long",
    timeZone: "UTC",
  });
  return { daysFromToday: offset, weekday };
}

// Milliseconds left before today's cutoff, or null outside the countdown
// window, after the cutoff, or when missing it wouldn't actually delay
// dispatch (Saturday evening: before or after 10 PM, it still goes Monday).
export function msUntilCutoff(nowMs = Date.now()) {
  const ist = istClock(nowMs);
  const cutoff = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), DISPATCH_CUTOFF_HOUR_IST);
  const left = cutoff - ist.getTime();
  if (left <= 0 || left > COUNTDOWN_WINDOW_MS) return null;
  const missedIt = nextDispatch(nowMs + left + 60 * 1000).daysFromToday;
  return missedIt > nextDispatch(nowMs).daysFromToday ? left : null;
}

// Calendar date `days` from today in IST, e.g. "Thu, 5 Nov".
export function formatDaysFromToday(days, nowMs = Date.now()) {
  return new Date(nowMs + days * DAY_MS).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}
