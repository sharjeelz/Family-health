// Finds Gree air conditioners on the local network and prints their addresses,
// so you can set AC_HOST in .env.local. Read-only — it never sends a command.
//   node scripts/find-ac.mjs
import dgram from "node:dgram";
import crypto from "node:crypto";
import os from "node:os";

const GENERIC_KEY = "a3K8Bx%2r8Y7#xDh";

// Broadcast a plaintext scan; every Gree unit replies with an encrypted pack.
const sock = dgram.createSocket({ type: "udp4", reuseAddr: true });
const found = [];

sock.on("message", (msg, rinfo) => {
  try {
    const d = crypto.createDecipheriv("aes-128-ecb", GENERIC_KEY, null);
    d.setAutoPadding(false);
    const out = d.update(JSON.parse(msg.toString()).pack, "base64", "utf8") + d.final("utf8");
    const pack = JSON.parse(out.slice(0, out.lastIndexOf("}") + 1));
    found.push(rinfo.address);
    console.log(`${rinfo.address}  ${pack.brand || "?"} ${pack.model || ""} (mac ${pack.mac})`);
  } catch {
    // Something else answered on 7000 — not a Gree unit.
  }
});

// 255.255.255.255 alone does not reach the unit on a typical Windows/wifi
// setup, so also probe each interface's own subnet broadcast address.
function broadcastAddresses() {
  const out = new Set(["255.255.255.255"]);
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces || []) {
      if (i.family !== "IPv4" || i.internal) continue;
      const ip = i.address.split(".").map(Number);
      const mask = i.netmask.split(".").map(Number);
      out.add(ip.map((o, n) => o | (~mask[n] & 255)).join("."));
    }
  }
  return [...out];
}

sock.bind(() => {
  sock.setBroadcast(true);
  const probe = Buffer.from('{"t":"scan"}');
  for (const addr of broadcastAddresses()) {
    sock.send(probe, 0, probe.length, 7000, addr);
  }
});

setTimeout(() => {
  console.log(found.length ? `\nSet AC_HOST to one of the above.` : "\nNo Gree units answered.");
  sock.close();
  process.exit(0);
}, 5000);
