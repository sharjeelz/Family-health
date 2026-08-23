"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

// How often each tile pulls a fresh frame. Stills rather than video: the
// recorder speaks RTSP, which no browser plays, and transcoding every camera
// would cost more than this screen is worth. About a second and a half reads
// as live for "is the car there, who is at the gate".
const REFRESH_MS = 1500;

// Leaving a live view of your gate on a screen in the kitchen is a different
// thing from leaving a prayer countdown there, so the tab returns itself to
// the grid — and stops fetching — after a while untouched.
const IDLE_MS = 5 * 60 * 1000;

function Tile({ camera, name, big, onOpen }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);
  const [stamp, setStamp] = useState(0);

  // A plain <img src> would be served from cache forever; the counter forces
  // each request to reach the recorder.
  useEffect(() => {
    let alive = true;
    let timer;

    const tick = () => {
      if (!alive) return;
      // Only fetch while the tablet is actually showing this — otherwise the
      // dashboard hammers the recorder all day for a tab nobody is watching.
      if (document.visibilityState === "visible") setStamp((n) => n + 1);
      timer = setTimeout(tick, REFRESH_MS);
    };
    timer = setTimeout(tick, REFRESH_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setSrc(`/api/camera/${camera}?t=${stamp}`);
  }, [camera, stamp]);

  return (
    <button
      onClick={onOpen}
      className={`relative overflow-hidden rounded-2xl bg-ink-900 block w-full text-left ${
        big ? "aspect-video" : "aspect-video"
      }`}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setError("No signal")}
          onLoad={() => setError(null)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {error && (
        <span className="absolute inset-0 flex items-center justify-center text-sand-200/70 font-700 text-sm">
          {error}
        </span>
      )}

      <span className="absolute left-0 bottom-0 right-0 bg-gradient-to-t from-ink-900/80 to-transparent px-3 py-2">
        <span className="text-sand-50 font-800 text-xs uppercase tracking-wider">{name}</span>
      </span>
    </button>
  );
}

export default function CamerasTab() {
  const [state, setState] = useState({ status: "loading" });
  const [focused, setFocused] = useState(null);
  const idleRef = useRef(null);

  useEffect(() => {
    fetchJson("/api/camera")
      .then((d) =>
        d.enabled === false
          ? setState({ status: "unconfigured" })
          : setState({ status: "ready", cameras: d.cameras, device: d.device, error: d.error })
      )
      .catch((e) => setState({ status: "error", error: e.message }));
  }, []);

  // Any touch resets the idle timer; when it expires we drop back to the grid.
  const poke = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setFocused(null), IDLE_MS);
  }, []);

  useEffect(() => {
    poke();
    return () => idleRef.current && clearTimeout(idleRef.current);
  }, [poke, focused]);

  if (state.status === "loading") {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5">
        <p className="text-center text-ink-700/45 text-sm py-6">Connecting to the recorder…</p>
      </section>
    );
  }

  if (state.status === "unconfigured") {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-600 text-ink-800 mb-1">Cameras</h2>
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center mt-3">
          <p className="text-sm font-700 text-ink-800">Not connected yet</p>
          <p className="text-sm text-ink-700/55 mt-1 leading-snug">
            Set NVR_HOST, NVR_USER, NVR_PASSWORD and NVR_CAMERAS in .env.local. Only
            works on the home network.
          </p>
        </div>
      </section>
    );
  }

  if (state.status === "error" || state.error) {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-600 text-ink-800 mb-1">Cameras</h2>
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center mt-3">
          <p className="text-sm font-700 text-ink-800">Can&apos;t reach the recorder</p>
          <p className="text-sm text-ink-700/55 mt-1">{state.error}</p>
          <p className="text-sm text-ink-700/45 mt-2 leading-snug">
            Cameras only work on the home wifi.
          </p>
        </div>
      </section>
    );
  }

  const list = state.cameras || [];
  const shown = focused ? list.filter((c) => c.camera === focused) : list;

  return (
    <div className="space-y-5" onPointerDown={poke}>
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-display text-2xl font-600 text-ink-800">
            {focused ? list.find((c) => c.camera === focused)?.name : "Cameras"}
          </h2>
          {focused && (
            <button
              onClick={() => setFocused(null)}
              className="text-xs font-800 text-clay-600 bg-clay-400/15 px-3 py-1.5 rounded-full"
            >
              ← All cameras
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <p className="text-center text-ink-700/45 text-sm py-6">
            No cameras listed in NVR_CAMERAS.
          </p>
        ) : (
          <div className={`grid gap-3 ${focused ? "" : "sm:grid-cols-2 wall:grid-cols-2"}`}>
            {shown.map((c) => (
              <Tile
                key={c.camera}
                camera={c.camera}
                name={c.name}
                big={Boolean(focused)}
                onOpen={() => setFocused(focused ? null : c.camera)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
