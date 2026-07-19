"use client";

import { useEffect } from "react";

// Service worker lifecycle:
//   • Production: register /sw.js for offline + instant loads, and auto-reload
//     the page when a new deploy takes over (so a kiosk never sits on an old
//     version).
//   • Local dev: do NOT register — and actively unregister any old worker and
//     clear its caches, so development never serves stale files.
export default function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "[::1]";

    if (isLocal) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if (window.caches) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    // --- production ---
    let hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    function onControllerChange() {
      // First control on a fresh visit isn't an update — don't reload for it.
      if (!hadController) {
        hadController = true;
        return;
      }
      if (reloading) return;
      reloading = true;
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let cleanup = () => {};
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        reg.update(); // check for a newer version right away
        const iv = setInterval(() => reg.update(), 60 * 60 * 1000); // hourly
        const onVis = () => {
          if (document.visibilityState === "visible") reg.update();
        };
        document.addEventListener("visibilitychange", onVis);
        cleanup = () => {
          clearInterval(iv);
          document.removeEventListener("visibilitychange", onVis);
        };
      } catch {
        /* registration failure is non-fatal */
      }
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      cleanup();
    };
  }, []);

  return null;
}
