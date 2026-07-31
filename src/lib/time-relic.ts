export type Elapsed = {
  ms: number;
  micro: number;
  nano: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
  decades: number;
  centuries: number;
  millennia: number;
};

const addMonths = (d: Date, n: number) => {
  const r = new Date(d.getTime());
  const day = r.getDate();
  r.setDate(1);
  r.setMonth(r.getMonth() + n);
  const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(day, last));
  return r;
};

/** Calendar-accurate fractional months elapsed (handles leap years + month lengths). */
export function fractionalMonths(from: Date, to: Date): number {
  if (to <= from) return 0;
  let whole =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let anchor = addMonths(from, whole);
  if (anchor > to) {
    whole -= 1;
    anchor = addMonths(from, whole);
  }
  const next = addMonths(from, whole + 1);
  const frac = (to.getTime() - anchor.getTime()) / (next.getTime() - anchor.getTime());
  return whole + frac;
}

export function computeElapsed(startMs: number, nowMs: number): Elapsed {
  const ms = Math.max(0, nowMs - startMs);
  const seconds = ms / 1000;
  const days = seconds / 86400;
  const months = fractionalMonths(new Date(startMs), new Date(Math.max(startMs, nowMs)));
  const years = months / 12;
  return {
    ms,
    micro: ms * 1000,
    nano: ms * 1e6,
    seconds,
    minutes: seconds / 60,
    hours: seconds / 3600,
    days,
    weeks: days / 7,
    months,
    years,
    decades: years / 10,
    centuries: years / 100,
    millennia: years / 1000,
  };
}

export function fmt(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Big integers beyond safe formatting (micro/nano) rendered without exponent. */
export function fmtBig(value: number): string {
  return Math.floor(value)
    .toLocaleString("en-US", { maximumFractionDigits: 0, useGrouping: true })
    .replace(/[^\d,]/g, "");
}

export function toLocalInputs(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}
