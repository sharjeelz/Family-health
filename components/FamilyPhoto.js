"use client";

import { useState, useEffect } from "react";
import { PHOTOS } from "../lib/gallery";
import { SCENES } from "./IslamicScenes";

const ROTATE_MS = 8000; // each slide stays on screen this long

// Rotating photo card. Cross-fades through the family photos listed in
// lib/gallery.js. Until any are added, it falls back to a set of built-in
// Islamic art scenes so the card always looks intentional.
export default function FamilyPhoto() {
  const usingPhotos = PHOTOS.length > 0;
  const count = usingPhotos ? PHOTOS.length : SCENES.length;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), ROTATE_MS);
    return () => clearInterval(t);
  }, [count]);

  const caption = usingPhotos ? PHOTOS[i]?.caption : SCENES[i]?.caption;

  return (
    <section className="relative rounded-3xl shadow-card overflow-hidden bg-ink-900">
      <div className="relative aspect-[16/10]">
        {usingPhotos
          ? PHOTOS.map((p, idx) => (
              <img
                key={p.src}
                src={p.src}
                alt={p.caption || "Family photo"}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                style={{ opacity: idx === i ? 1 : 0 }}
              />
            ))
          : SCENES.map((s, idx) => (
              <div
                key={s.id}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: idx === i ? 1 : 0 }}
              >
                <s.Comp />
              </div>
            ))}

        {caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent p-4">
            <p className="text-sand-50 font-700 text-sm">{caption}</p>
          </div>
        )}
      </div>

      {/* progress dots */}
      {count > 1 && (
        <div className="absolute top-3 right-3 flex gap-1.5">
          {Array.from({ length: count }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
