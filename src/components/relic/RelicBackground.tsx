import { useMemo } from "react";

const SYMBOLS = ["☉", "☾", "♅", "♆", "☿", "♃", "♄", "⚸", "✶", "⚚", "☥", "⟁"];

// Deterministic seeded PRNG so server and client render identical values
// (avoids hydration mismatch from Math.random()).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function RelicBackground() {
  const embers = useMemo(() => {
    const rand = mulberry32(1337);
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 2 + rand() * 4,
      delay: rand() * 18,
      dur: 16 + rand() * 18,
      drift: `${(rand() - 0.5) * 160}px`,
    }));
  }, []);
  const dust = useMemo(() => {
    const rand = mulberry32(7331);
    return Array.from({ length: 34 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 2.5,
      delay: rand() * 30,
      dur: 30 + rand() * 40,
      drift: `${(rand() - 0.5) * 240}px`,
    }));
  }, []);
  const sigils = useMemo(() => {
    const rand = mulberry32(4242);
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      glyph: SYMBOLS[i % SYMBOLS.length],
      left: 5 + rand() * 90,
      top: 5 + rand() * 90,
      size: 28 + rand() * 64,
      delay: rand() * 16,
      dur: 14 + rand() * 14,
      rot: `${(rand() - 0.5) * 40}deg`,
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* fog */}
      <div
        className="anim-fog absolute -inset-1/4 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 70%, oklch(0.72 0.18 52 / 0.10), transparent 55%), radial-gradient(ellipse at 70% 30%, oklch(0.83 0.14 85 / 0.09), transparent 60%)",
        }}
      />
      {/* grain */}
      <div className="grain absolute inset-0 opacity-40" />

      {/* ancient symbols */}
      {sigils.map((s) => (
        <span
          key={s.id}
          className="absolute font-display text-gold select-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            ["--rot" as string]: s.rot,
            animation: `sigil-fade ${s.dur}s ease-in-out ${s.delay}s infinite`,
            opacity: 0,
          }}
        >
          {s.glyph}
        </span>
      ))}

      {/* dust */}
      {dust.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-parchment"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: 0,
            ["--drift" as string]: d.drift,
            animation: `dust-float ${d.dur}s linear ${d.delay}s infinite`,
          }}
        />
      ))}

      {/* embers */}
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-0 rounded-full bg-ember"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            opacity: 0,
            boxShadow: "0 0 10px 2px oklch(0.72 0.18 52 / 0.6)",
            ["--drift" as string]: e.drift,
            animation: `ember-rise ${e.dur}s linear ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
