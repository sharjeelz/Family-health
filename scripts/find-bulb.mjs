// Looks for Tuya-based smart devices on the local network.
//
// Most small-brand smart bulbs — whatever the app is called — are Tuya devices
// underneath. Tuya devices broadcast their presence every few seconds: in the
// clear on UDP 6666 (older firmware) and AES-encrypted on 6667 (v3.3+), with a
// key that is the same on every device and publicly known.
//
// Read-only: this listens, it never sends anything or touches a device.
//   node scripts/find-bulb.mjs
import dgram from "node:dgram";
import crypto from "node:crypto";

// md5("yGAdlopoPVldABfn") — Tuya's fixed discovery key.
const UDP_KEY = crypto.createHash("md5").update("yGAdlopoPVldABfn").digest();

function decode(buf) {
  // Frames are 0x000055AA <seq> <cmd> <len> <payload> <crc> 0x0000AA55.
  let body = buf.length > 20 ? buf.subarray(20, buf.length - 8) : buf;
  const text = body.toString("utf8");
  if (text.trimStart().startsWith("{")) return text; // 6666: plaintext

  try {
    const d = crypto.createDecipheriv("aes-128-ecb", UDP_KEY, null);
    return d.update(body) + d.final("utf8");
  } catch {
    return null;
  }
}

const found = new Map();

for (const port of [6666, 6667]) {
  const sock = dgram.createSocket({ type: "udp4", reuseAddr: true });
  sock.on("message", (msg, rinfo) => {
    const json = decode(msg);
    if (!json) return;
    try {
      const d = JSON.parse(json.slice(json.indexOf("{"), json.lastIndexOf("}") + 1));
      const ip = d.ip || rinfo.address;
      if (found.has(ip)) return;
      found.set(ip, d);
      console.log(`${ip.padEnd(15)} id=${d.gwId || d.devId || "?"}  version=${d.version || "?"}  product=${d.productKey || "?"}`);
    } catch {
      // Some other device answering on the same port.
    }
  });
  sock.on("error", () => {});
  sock.bind(port);
}

console.log("listening for Tuya broadcasts on UDP 6666 and 6667 (about 15s)...\n");
setTimeout(() => {
  if (!found.size) {
    console.log("\nNo Tuya devices announced themselves.");
    console.log("The bulb is either not Tuya-based, on another network, or Bluetooth-only.");
  } else {
    console.log(`\n${found.size} device(s) found. The id is what a local-control setup needs,`);
    console.log("along with a per-device 'local key' obtained from a Tuya developer account.");
  }
  process.exit(0);
}, 15000);
