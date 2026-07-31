export function TimeCard({
  icon,
  title,
  value,
  index = 0,
  wide,
}: {
  icon: string;
  title: string;
  value: string;
  index?: number;
  wide?: boolean;
}) {
  return (
    <article
      className={`panel-stone anim-float group rounded-sm p-4 transition-shadow duration-500 hover:shadow-[var(--glow-gold)] sm:p-5 ${
        wide ? "sm:col-span-2" : ""
      }`}
      style={{ animationDelay: `${(index % 6) * 0.4}s` }}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.83 0.14 85 / 0.14), transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <h3 className="font-serif text-[0.62rem] tracking-[0.28em] text-muted-foreground uppercase">
          {title}
        </h3>
      </div>
      <p
        key={value}
        className="text-engraved tick-pop relative mt-2 font-display text-xl leading-tight break-all tabular-nums sm:text-2xl"
      >
        {value}
      </p>
    </article>
  );
}
