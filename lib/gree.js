// Gree air-conditioner client. SERVER ONLY — needs a UDP socket, which the
// browser does not have. Never import this from a "use client" component.
//
// The unit speaks AES-128-ECB encrypted JSON over UDP 7000. Handshake is:
// scan -> the device answers with its mac -> bind with the well-known generic
// key -> the device hands back a per-device key used for everything after.
import dgram from "node:dgram";
import crypto from "node:crypto";

const GENERIC_KEY = "a3K8Bx%2r8Y7#xDh";
const PORT = 7000;
const TIMEOUT = 3000;

const HOST = process.env.AC_HOST;

// Columns we read on every status poll.
const COLS = ["Pow", "SetTem", "WdSpd", "Mod", "Lig", "SwUpDn", "Quiet", "Tur", "TemSen"];

// Gree encodes mode and fan as integers; the dashboard uses names.
const MODE_TO_NUM = { auto: 0, cool: 1, dry: 2, fan: 3, heat: 4 };
const NUM_TO_MODE = ["auto", "cool", "dry", "fan", "heat"];
// The unit has six fan steps; the dashboard offers four. Map onto low/med/high.
const FAN_TO_NUM = { auto: 0, low: 1, med: 3, high: 5 };
function numToFan(n) {
  if (n === 0) return "auto";
  if (n <= 2) return "low";
  if (n <= 4) return "med";
  return "high";
}

function decrypt(b64, key) {
  const d = crypto.createDecipheriv("aes-128-ecb", key, null);
  d.setAutoPadding(false);
  const out = d.update(b64, "base64", "utf8") + d.final("utf8");
  // The payload is zero-padded to the block size; trim back to the JSON.
  return JSON.parse(out.slice(0, out.lastIndexOf("}") + 1));
}

function encrypt(obj, key) {
  const c = crypto.createCipheriv("aes-128-ecb", key, null);
  return c.update(JSON.stringify(obj), "utf8", "base64") + c.final("base64");
}

// One request/response exchange. The socket is per-call: these are rare,
// user-driven actions, and a long-lived socket would just be state to lose.
function exchange(payload, key, { expect }) {
  return new Promise((resolve, reject) => {
    const sock = dgram.createSocket({ type: "udp4", reuseAddr: true });
    const timer = setTimeout(() => {
      sock.close();
      reject(new Error("AC did not respond"));
    }, TIMEOUT);

    const done = (fn, arg) => {
      clearTimeout(timer);
      try { sock.close(); } catch {}
      fn(arg);
    };

    sock.on("error", (e) => done(reject, e));
    sock.on("message", (msg) => {
      try {
        const pack = decrypt(JSON.parse(msg.toString()).pack, key);
        if (expect && pack.t !== expect) return; // not ours; keep waiting
        done(resolve, pack);
      } catch (e) {
        done(reject, e);
      }
    });

    sock.bind(() => {
      const buf = Buffer.from(JSON.stringify(payload));
      sock.send(buf, 0, buf.length, PORT, HOST, (e) => e && done(reject, e));
    });
  });
}

// The per-device key survives across requests; rebinding on every call would
// add a round trip to every button press. Cached on globalThis so dev hot
// reloads don't lose it.
const g = globalThis;

async function session() {
  if (g._greeSession) return g._greeSession;
  if (!HOST) throw new Error("AC_HOST is not set");

  const dev = await exchange({ t: "scan" }, GENERIC_KEY, { expect: "dev" });
  const mac = dev.mac || dev.cid;
  const bound = await exchange(
    { cid: "app", i: 1, t: "pack", uid: 0, tcid: mac, pack: encrypt({ mac, t: "bind", uid: 0 }, GENERIC_KEY) },
    GENERIC_KEY,
    { expect: "bindok" }
  );

  g._greeSession = { mac, key: bound.key };
  return g._greeSession;
}

// A failed exchange usually means the key went stale (unit rebooted or another
// app rebound it). Drop the session and try once more before giving up.
async function withSession(fn) {
  try {
    return await fn(await session());
  } catch (e) {
    g._greeSession = null;
    return await fn(await session());
  }
}

export async function getState() {
  return withSession(async ({ mac, key }) => {
    const res = await exchange(
      { cid: "app", i: 0, t: "pack", uid: 0, tcid: mac, pack: encrypt({ cols: COLS, mac, t: "status" }, key) },
      key,
      { expect: "dat" }
    );
    const raw = Object.fromEntries(res.cols.map((c, i) => [c, res.dat[i]]));
    return {
      power: raw.Pow === 1,
      temp: raw.SetTem,
      mode: NUM_TO_MODE[raw.Mod] || "cool",
      fan: numToFan(raw.WdSpd),
      light: raw.Lig === 1,
      // The unit reports its sensor as °C + 40. Some models don't report at
      // all, in which case leave it out rather than showing a wrong number.
      roomTemp: raw.TemSen > 40 ? raw.TemSen - 40 : null,
    };
  });
}

export async function setState(patch) {
  const opt = [];
  const p = [];
  if (patch.power !== undefined) { opt.push("Pow"); p.push(patch.power ? 1 : 0); }
  if (patch.temp !== undefined) { opt.push("SetTem"); p.push(Math.min(30, Math.max(16, Math.round(patch.temp)))); }
  if (patch.mode !== undefined && MODE_TO_NUM[patch.mode] !== undefined) { opt.push("Mod"); p.push(MODE_TO_NUM[patch.mode]); }
  if (patch.fan !== undefined && FAN_TO_NUM[patch.fan] !== undefined) { opt.push("WdSpd"); p.push(FAN_TO_NUM[patch.fan]); }
  if (patch.light !== undefined) { opt.push("Lig"); p.push(patch.light ? 1 : 0); }
  if (!opt.length) return getState();

  await withSession(async ({ mac, key }) =>
    exchange(
      { cid: "app", i: 0, t: "pack", uid: 0, tcid: mac, pack: encrypt({ opt, p, t: "cmd" }, key) },
      key,
      { expect: "res" }
    )
  );

  // Report what the unit actually did, not what we asked for.
  return getState();
}
