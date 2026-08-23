"use client";

// A quiet label above a row of cards, so the dashboard reads as grouped
// sections rather than one long run of white boxes. The rule fills the
// remaining width to carry the eye across the row.
export default function SectionTitle({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <p className="text-ink-700/40 font-800 text-[0.65rem] uppercase tracking-[0.18em] shrink-0">
        {children}
      </p>
      <span className="h-px flex-1 bg-sand-200" />
    </div>
  );
}
