"use client";

import { useEffect } from "react";

// Keeps the tablet screen on while the dashboard is open (Screen Wake Lock).
// Re-acquires when the tab becomes visible again. No-op where unsupported or on
// non-secure origins.
export default function KeepAwake() {
  useEffect(() => {
    let lock = null;
    let released = false;

    const request = async () => {
      try {
        if ("wakeLock" in navigator && document.visibilityState === "visible") {
          lock = await navigator.wakeLock.request("screen");
          lock.addEventListener?.("release", () => {
            lock = null;
          });
        }
      } catch {
        /* denied/unsupported — fine */
      }
    };

    request();
    const onVis = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVis);
      if (lock) lock.release().catch(() => {});
    };
  }, []);

  return null;
}
