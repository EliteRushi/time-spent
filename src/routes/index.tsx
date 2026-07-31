import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { RelicBackground } from "@/components/relic/RelicBackground";
import { AncientClock } from "@/components/relic/AncientClock";
import { TimeCard } from "@/components/relic/TimeCard";
import { computeElapsed, fmt, fmtBig, toLocalInputs } from "@/lib/time-relic";

const DEFAULT_START = new Date(2002, 5, 3, 0, 0, 0, 0); // 03/06/2002 00:00:00

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ancient Time Relic — Live Counter Since 03/06/2002" },
      {
        name: "description",
        content:
          "A mystical bronze-and-gold timekeeping artifact counting every second, month, century and millennium elapsed since 3 June 2002 — live, to the nanosecond.",
      },
      { property: "og:title", content: "Ancient Time Relic — Live Counter Since 03/06/2002" },
      {
        property: "og:description",
        content:
          "A mystical bronze-and-gold timekeeping artifact counting every second, month, century and millennium elapsed since 3 June 2002 — live, to the nanosecond.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RelicPage,
});

function useAudioChimes(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(
    (type: "tick" | "bell") => {
      if (!enabled) return;
      try {
        if (!ctxRef.current)
          ctxRef.current = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)();
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") void ctx.resume();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime;
        if (type === "tick") {
          o.type = "square";
          o.frequency.setValueAtTime(1400, t);
          g.gain.setValueAtTime(0.04, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
          o.start(t);
          o.stop(t + 0.06);
        } else {
          o.type = "sine";
          o.frequency.setValueAtTime(110, t);
          g.gain.setValueAtTime(0.22, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
          o.start(t);
          o.stop(t + 3.3);
        }
      } catch {
        /* audio unavailable */
      }
    },
    [enabled],
  );
}

function RelicPage() {
  const defaults = toLocalInputs(DEFAULT_START);
  const [startMs, setStartMs] = useState(DEFAULT_START.getTime());
  const [dateVal, setDateVal] = useState(defaults.date);
  const [timeVal, setTimeVal] = useState(defaults.time);
  const [now, setNow] = useState(() => new Date());
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [light, setLight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const play = useAudioChimes(sound);
  const lastSecond = useRef(-1);
  const lastHour = useRef(-1);
  const frozen = useRef<Date>(new Date());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lightmode", light);
  }, [light]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (!paused) {
        const d = new Date();
        frozen.current = d;
        setNow(d);
        if (d.getSeconds() !== lastSecond.current) {
          lastSecond.current = d.getSeconds();
          play("tick");
          if (d.getMinutes() === 0 && d.getSeconds() === 0) {
            if (lastHour.current !== d.getHours()) {
              lastHour.current = d.getHours();
              play("bell");
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, play]);

  const e = computeElapsed(startMs, now.getTime());

  const startClock = () => {
    const [y, mo, da] = dateVal.split("-").map(Number);
    const [hh = 0, mm = 0, ss = 0] = timeVal.split(":").map(Number);
    if (!y || !mo || !da) return;
    setStartMs(new Date(y, mo - 1, da, hh, mm, ss, 0).getTime());
    setPaused(false);
  };

  const reset = () => {
    setStartMs(DEFAULT_START.getTime());
    setDateVal(defaults.date);
    setTimeVal(defaults.time);
    setPaused(false);
  };

  const copy = async () => {
    const text = [
      `Elapsed since ${new Date(startMs).toLocaleString()}`,
      `Seconds: ${fmt(e.seconds)}`,
      `Minutes: ${fmt(e.minutes)}`,
      `Hours: ${fmt(e.hours)}`,
      `Days: ${fmt(e.days)}`,
      `Weeks: ${fmt(e.weeks, 1)}`,
      `Months: ${fmt(e.months, 1)}`,
      `Years: ${fmt(e.years, 2)}`,
      `Decades: ${fmt(e.decades, 3)}`,
      `Centuries: ${fmt(e.centuries, 4)}`,
      `Millennia: ${fmt(e.millennia, 5)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const fullscreen = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  const cards = [
    { icon: "⌛", title: "Seconds", value: fmt(e.seconds) },
    { icon: "🕯", title: "Minutes", value: fmt(e.minutes) },
    { icon: "🜚", title: "Hours", value: fmt(e.hours) },
    { icon: "☀", title: "Days", value: fmt(e.days) },
    { icon: "☾", title: "Weeks", value: fmt(e.weeks, 1) },
    { icon: "🜛", title: "Months", value: fmt(e.months, 1) },
    { icon: "♄", title: "Years", value: fmt(e.years, 2) },
    { icon: "⚱", title: "Decades", value: fmt(e.decades, 3) },
    { icon: "🏛", title: "Centuries", value: fmt(e.centuries, 4) },
    { icon: "✶", title: "Millennia", value: fmt(e.millennia, 5) },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <RelicBackground />

      {loading && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background"
          style={{ animation: "veil-out 0.7s ease 1.1s forwards" }}
        >
          <div className="text-center">
            <div className="anim-gear mx-auto h-20 w-20 rounded-full border-2 border-dashed border-bronze" />
            <p className="text-engraved mt-6 font-display text-sm tracking-[0.4em]">
              AWAKENING THE RELIC
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="text-center">
          <p className="font-serif text-[0.6rem] tracking-[0.45em] text-muted-foreground uppercase sm:text-xs">
            Horologium Antiquum
          </p>
          <h1 className="text-engraved mt-3 font-display text-3xl leading-tight font-bold sm:text-5xl">
            The Ancient Time Relic
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-mono text-sm text-muted-foreground sm:text-base">
            Counting ceaselessly since{" "}
            <span className="text-gold">
              {new Date(startMs).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </p>
          <p className="mt-1 font-serif text-[0.65rem] tracking-[0.25em] text-bronze uppercase">
            Present hour · {now.toLocaleString()}
          </p>
        </header>

        {/* Controls */}
        <section
          aria-label="Clock controls"
          className="panel-stone mt-8 rounded-sm p-4 sm:p-5"
        >
          <div className="relative flex flex-wrap items-end justify-center gap-3">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="font-serif text-[0.55rem] tracking-[0.25em] text-muted-foreground uppercase">
                Date
              </span>
              <input
                type="date"
                className="relic-input"
                value={dateVal}
                onChange={(ev) => setDateVal(ev.target.value)}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="font-serif text-[0.55rem] tracking-[0.25em] text-muted-foreground uppercase">
                Time
              </span>
              <input
                type="time"
                step={1}
                className="relic-input"
                value={timeVal}
                onChange={(ev) => setTimeVal(ev.target.value)}
              />
            </label>
            <button className="relic-btn" data-variant="gold" onClick={startClock}>
              Start Clock
            </button>
            <button className="relic-btn" onClick={reset}>
              Reset to Default
            </button>
            <button
              className="relic-btn"
              data-active={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button className="relic-btn" onClick={copy}>
              {copied ? "Copied ✓" : "Copy Elapsed"}
            </button>
            <button
              className="relic-btn"
              data-active={sound}
              onClick={() => setSound((s) => !s)}
            >
              {sound ? "Sound On" : "Sound Off"}
            </button>
            <button
              className="relic-btn"
              data-active={light}
              onClick={() => setLight((l) => !l)}
            >
              {light ? "Sun Temple" : "Night Crypt"}
            </button>
            <button className="relic-btn" onClick={fullscreen}>
              Fullscreen
            </button>
          </div>
        </section>

        {/* Clock */}
        <section aria-label="Ancient clock" className="mt-10 sm:mt-14">
          <AncientClock now={now} />
        </section>

        {/* Cards */}
        <section
          aria-label="Elapsed time units"
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {cards.map((c, i) => (
            <TimeCard key={c.title} index={i} {...c} />
          ))}
        </section>

        <section
          aria-label="Fine-grained counters"
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <TimeCard icon="⚙" title="Milliseconds" value={fmtBig(e.ms)} />
          <TimeCard icon="✦" title="Microseconds" value={fmtBig(e.micro)} />
          <TimeCard icon="⟁" title="Nanoseconds" value={fmtBig(e.nano)} />
        </section>

        <footer className="mt-14 pb-6 text-center font-serif text-[0.6rem] tracking-[0.3em] text-muted-foreground uppercase">
          Sic transit tempus · forged in bronze &amp; stone
        </footer>
      </div>
    </main>
  );
}
