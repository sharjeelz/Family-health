// Find the camera DVR/NVR on the home network.
//
// Read-only. It opens a TCP connection to a handful of ports on every address
// in your subnet, and for anything that answers on a web port it asks for the
// device description page. Hikvision boxes answer /ISAPI/System/deviceInfo with
// a 401 and a WWW-Authenticate header even before you log in — that 401 is the
// giveaway, and it is enough to identify the box without any credentials.
//
//   node scripts/find-cams.mjs
//   node scripts/find-cams.mjs 192.168.0     # force a subnet
//
// Run it on the laptop that will actually talk to the DVR, not this one — what
// matters is whether *that* machine can reach it.

import net from "node:net";
import os from "node:os";

// 80/8000 web + Hikvision SDK, 554 RTSP, 34567 Dahua/XM, 8899 some clones,
// 37777 Dahua, 443 https admin.
const PORTS = [80, 8000, 554, 443, 8899, 34567, 37777];
const CONNECT_TIMEOUT = 900;
const HTTP_TIMEOUT = 2500;

function subnets() {
  const arg = process.argv[2];
  if (arg) return [arg.replace(/\.$/, "")];
  const out = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family !== "IPv4" || a.internal) continue;
      out.push(a.address.split(".").slice(0, 3).join("."));
    }
  }
  return [...new Set(out)];
}

function probe(host, port) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let done = false;
    const finish = (open) => {
      if (done) return;
      done = true;
      sock.destroy();
      resolve(open);
    };
    sock.setTimeout(CONNECT_TIMEOUT);
    sock.once("connect", () => finish(true));
    sock.once("timeout", () => finish(false));
    sock.once("error", () => finish(false));
    sock.connect(port, host);
  });
}

// A 401 with a Digest challenge is the normal, expected answer from a locked
// Hikvision box. We never send credentials — we only read what it volunteers.
async function identify(host, port) {
  const scheme = port === 443 ? "https" : "http";
  const base = `${scheme}://${host}${port === 80 || port === 443 ? "" : `:${port}`}`;
  const notes = [];
  for (const path of ["/ISAPI/System/deviceInfo", "/"]) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), HTTP_TIMEOUT);
      const res = await fetch(base + path, { signal: ctl.signal, redirect: "manual" });
      clearTimeout(t);
      const auth = res.headers.get("www-authenticate") || "";
      const server = res.headers.get("server") || "";
      const body = res.status === 200 ? (await res.text()).slice(0, 400) : "";
      const title = /<title[^>]*>([^<]+)/i.exec(body)?.[1]?.trim();
      const model = /<model>([^<]+)</i.exec(body)?.[1];
      // A 200 alone means nothing — a router will happily answer any path with
      // its own error XML. Only a real DeviceInfo document counts.
      const isapi =
        res.status === 401
          ? /digest/i.test(auth)
          : /<DeviceInfo|<deviceType|<firmwareVersion/i.test(body);
      if (isapi && path === "/ISAPI/System/deviceInfo") notes.push("ISAPI-CONFIRMED");
      notes.push(
        [
          `${path} → ${res.status}`,
          server && `server=${server}`,
          auth && `auth=${auth.split(/[ ,]/)[0]}`,
          realmOf(auth) && `realm=${realmOf(auth)}`,
          model && `model=${model}`,
          title && `title=${title}`,
        ]
          .filter(Boolean)
          .join("  "),
      );
      if (path === "/ISAPI/System/deviceInfo" && (res.status === 401 || res.status === 200)) break;
    } catch {
      // TLS mismatch, plain socket, or nothing that speaks HTTP — not fatal.
    }
  }
  return notes;
}

function realmOf(auth) {
  return /realm="([^"]+)"/i.exec(auth || "")?.[1];
}

function guess(open, notes) {
  const text = notes.join(" ");
  if (text.includes("ISAPI-CONFIRMED")) return "Hikvision / Hik-Connect (ISAPI) — this is very likely your DVR";
  if (/realm=(DVR|DHS|Login to)/i.test(text)) return "some DVR web login";
  if (open.includes(34567) || open.includes(37777)) return "Dahua/XM-style DVR (not ISAPI)";
  if (open.includes(554)) return "speaks RTSP — a camera or DVR";
  return null;
}

const nets = subnets();
console.log(`Scanning ${nets.map((n) => `${n}.1-254`).join(", ")} on ports ${PORTS.join(", ")}\n`);

for (const net3 of nets) {
  const hosts = Array.from({ length: 254 }, (_, i) => `${net3}.${i + 1}`);
  // Keep the number of sockets in flight low. An earlier version opened 32
  // hosts x 7 ports at once and the DVR simply did not answer in time — it
  // reported the box as absent when it was sitting there the whole while. A
  // false negative here is worse than a slow scan.
  const found = [];
  for (let i = 0; i < hosts.length; i += 8) {
    const slice = hosts.slice(i, i + 8);
    const results = await Promise.all(
      slice.map(async (h) => {
        const open = (await Promise.all(PORTS.map(async (p) => ((await probe(h, p)) ? p : null)))).filter(Boolean);
        return open.length ? { host: h, open } : null;
      }),
    );
    found.push(...results.filter(Boolean));
    process.stdout.write(".");
  }
  process.stdout.write("\n\n");

  if (!found.length) {
    console.log(`Nothing answered on ${net3}.x`);
    continue;
  }

  for (const { host, open } of found) {
    const webPort = open.find((p) => p === 80 || p === 8000 || p === 443 || p === 8899);
    const notes = webPort ? await identify(host, webPort) : [];
    const label = guess(open, notes);
    console.log(`${host}  ports: ${open.join(", ")}${label ? `\n  → ${label}` : ""}`);
    for (const n of notes) console.log(`     ${n}`);
    console.log("");
  }
}
