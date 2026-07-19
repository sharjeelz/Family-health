"use client";

// Circular thumbnail. If a photo is given it's cropped to a face-framed circle
// (via object-cover + a per-photo focal point); otherwise the emoji is shown.
export default function Avatar({ photo, pos, emoji, size = 32, alt = "" }) {
  if (!photo) {
    return (
      <span aria-hidden="true" style={{ fontSize: size * 0.72, lineHeight: 1 }}>
        {emoji}
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
