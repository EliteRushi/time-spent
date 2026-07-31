const ROMAN = [
  "XII",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
];
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function AncientClock({ now }: { now: Date }) {
  const ms = now.getMilliseconds();
  const s = now.getSeconds() + ms / 1000;
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(88vw,34rem)]">
      {/* rotating zodiac ring */}
      <div className="anim-spin-slower absolute inset-0">
        {ZODIAC.map((z, i) => (
          <div
            key={z}
            className="absolute inset-0"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span
              className="absolute top-0 left-1/2 font-display text-bronze"
              style={{
                fontSize: "clamp(0.8rem,2.4vw,1.35rem)",
                transform: `translateX(-50%) rotate(${-i * 30}deg)`,
              }}
            >
              {z}
            </span>
          </div>
        ))}
      </div>


      {/* outer compass ring */}
      <div className="anim-spin-rev absolute inset-[7%] rounded-full border border-border opacity-70">
        {Array.from({ length: 72 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ transform: `rotate(${i * 5}deg)` }}
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-bronze"
              style={{
                width: i % 6 === 0 ? 2 : 1,
                height: i % 6 === 0 ? 12 : 6,
                opacity: 0.6,
              }}
            />
          </div>
        ))}
      </div>


      {/* dial face */}
      <div
        className="panel-stone glow-ring anim-pulse-glow absolute inset-[12%] rounded-full"
        style={{ borderRadius: "9999px" }}
      >
        <div className="grain absolute inset-0 rounded-full opacity-50" />
        <div
          className="absolute inset-[4%] rounded-full border"
          style={{ borderColor: "var(--gold)", opacity: 0.45 }}
        />
        <div
          className="absolute inset-[9%] rounded-full border border-dashed"
          style={{ borderColor: "var(--bronze)", opacity: 0.5 }}
        />

        {/* roman numerals */}
        {ROMAN.map((r, i) => (
          <div
            key={r}
            className="absolute inset-0"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span
              className="text-engraved absolute top-[7%] left-1/2 font-display font-bold"
              style={{
                fontSize: "clamp(0.7rem,2.6vw,1.25rem)",
                transform: `translateX(-50%) rotate(${-i * 30}deg)`,
              }}
            >
              {r}
            </span>
          </div>
        ))}

        {/* minute ticks */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ transform: `rotate(${i * 6}deg)` }}
          >
            <span
              className="absolute top-[16%] left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: i % 5 === 0 ? 2.5 : 1.5,
                height: i % 5 === 0 ? 10 : 5,
                background: i % 5 === 0 ? "var(--gold)" : "var(--bronze)",
                opacity: i % 5 === 0 ? 0.9 : 0.5,
              }}
            />
          </div>
        ))}

        {/* engraved center sigil */}
        <span
          className="text-engraved absolute top-[32%] left-1/2 -translate-x-1/2 font-display"
          style={{ fontSize: "clamp(1rem,3vw,1.6rem)", opacity: 0.7 }}
        >
          ☉
        </span>
        <span
          className="absolute bottom-[26%] left-1/2 -translate-x-1/2 font-serif tracking-[0.35em] text-muted-foreground"
          style={{ fontSize: "clamp(0.45rem,1.4vw,0.65rem)" }}
        >
          TEMPVS · FVGIT
        </span>

        {/* hands */}
        <Hand angle={h * 30} lengthPct={26} width={7} color="var(--gold)" />
        <Hand angle={m * 6} lengthPct={36} width={4.5} color="var(--parchment)" />
        <Hand angle={s * 6} lengthPct={41} width={2} color="var(--ember)" glow />

        <span
          className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "var(--gradient-gold)",
            boxShadow: "var(--glow-gold)",
          }}
        />
      </div>

      {/* gears */}
      <Gear className="anim-gear absolute -bottom-2 -left-2 h-16 w-16 opacity-60 sm:h-20 sm:w-20" />
      <Gear className="anim-gear-rev absolute -top-1 -right-1 h-12 w-12 opacity-50 sm:h-16 sm:w-16" />
    </div>
  );
}

function Hand({
  angle,
  lengthPct,
  width,
  color,
  glow,
}: {
  angle: number;
  lengthPct: number;
  width: number;
  color: string;
  glow?: boolean;
}) {
  return (
    <div
      className="absolute top-1/2 left-1/2 origin-bottom"
      style={{
        width,
        height: `${lengthPct}%`,
        transform: `translate(-50%,-100%) rotate(${angle}deg)`,
        transformOrigin: "50% 100%",
        background: color,
        borderRadius: 99,
        boxShadow: glow ? "var(--glow-ember)" : "0 2px 6px oklch(0 0 0 / 0.5)",
      }}
    />
  );
}

function Gear({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g fill="none" stroke="var(--bronze)" strokeWidth="4">
        <circle cx="50" cy="50" r="26" />
        <circle cx="50" cy="50" r="10" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="18"
            x2="50"
            y2="6"
            transform={`rotate(${i * 36} 50 50)`}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
