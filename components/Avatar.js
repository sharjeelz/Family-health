"use client";

// Circular thumbnail. If a photo is given it's cropped to a face-framed circle
// (via object-cover + a per-photo focal point); otherwise it falls back to the
// person's initial, which reads better than an emoji at small sizes.
export default function Avatar({ photo, pos, size = 32, alt = "" }) {
  if (!photo) {
    const initial = (alt || "").trim().charAt(0).toUpperCase();
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-sand-100 border border-sand-200 text-ink-700/60 font-800 shrink-0 align-middle"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }
  return (
    <span
      className="inline-block rounded-full overflow-hidden bg-sand-100 border border-sand-200 shrink-0 align-middle"
      style={{ width: size, height: size }}
    >
      <img
        src={photo}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{ objectPosition: pos || "center" }}
      />
    </span>
  );
}
