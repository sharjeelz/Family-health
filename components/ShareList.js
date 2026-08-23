"use client";

import { useState } from "react";

// Getting a list off the fridge tablet and into your pocket.
//
// A wa.me link opens WhatsApp on whatever device you tapped it on — the
// tablet — which only helps if WhatsApp is signed in there. The QR is the
// useful path: scan it on the way out and your own phone opens WhatsApp with
// the list already typed, ready to send to whoever is shopping.
export default function ShareList({ title, lines, body, compact, disabled, label = "list" }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // Either a bulleted list (shopping) or a ready-made block of text (a whole
  // recipe, which brings its own headings and numbering).
  const text = body ?? [title, ...(lines || []).map((l) => `• ${l}`)].join("\n");
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  // What the QR has to carry is the wa.me URL itself. Measuring the
  // percent-encoded form instead double-counts it — the ?data= query string
  // encodes it a second time — and wrongly rejected recipes that fit easily.
  //
  // A QR in byte mode holds 2953 bytes at the lowest error correction, so
  // almost every recipe fits whole. Only a very long one falls back to the
  // short version (title and video link).
  const QR_LIMIT = 2900;
  const full = waUrl.length <= QR_LIMIT;
  const qrText = full ? text : compact;
  const qrUrl = qrText ? `https://wa.me/?text=${encodeURIComponent(qrText)}` : null;
  const canScan = Boolean(qrUrl) && qrUrl.length <= QR_LIMIT;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (disabled) return null;

  return (
    <div className="mt-4 pt-4 border-t border-sand-200">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-sage-500 text-white font-800 text-xs px-4 py-2"
        >
          Send on WhatsApp
        </a>
        <button
          onClick={() => setShowQr((v) => !v)}
          aria-pressed={showQr}
          className={`rounded-full font-800 text-xs px-4 py-2 transition-colors ${
            showQr ? "bg-ink-800 text-sand-50" : "bg-sand-100 text-ink-700/60 hover:bg-sand-200"
          }`}
        >
          {showQr ? "Hide code" : "Scan to my phone"}
        </button>
        <button
          onClick={copy}
          className="rounded-full bg-sand-100 text-ink-700/60 font-800 text-xs px-4 py-2 hover:bg-sand-200 transition-colors"
        >
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>

      {showQr && !canScan && (
        <div className="mt-4 rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-4">
          <p className="text-sm font-800 text-ink-800">Too long for a QR code</p>
          <p className="text-sm text-ink-700/55 leading-snug mt-1">
            Use “Send on WhatsApp” or “Copy text” instead — a code this size would not
            scan reliably from a tablet screen.
          </p>
        </div>
      )}

      {showQr && canScan && (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr?data=${encodeURIComponent(qrUrl)}`}
            alt={`QR code that opens WhatsApp on your phone with this ${label}`}
            className="w-44 h-44 rounded-2xl border border-sand-200 bg-white p-2 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-800 text-ink-800">
              Scan with your phone{!full && " — short version"}
            </p>
            <p className="text-sm text-ink-700/55 leading-snug mt-1">
              WhatsApp opens with the {label} already typed. Pick who to send it to — or
              send it to yourself so it is in your hand when you need it.
            </p>
            <pre className="mt-3 text-[0.7rem] text-ink-700/50 font-600 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {qrText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
