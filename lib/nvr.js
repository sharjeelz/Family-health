// Hikvision NVR/DVR access over ISAPI. SERVER ONLY — this holds the recorder's
// address and credentials, neither of which should ever reach the tablet.
//
// The phone app reaches the DVR through Hik-Connect's cloud relay, which is a
// proprietary P2P protocol. We use the device's own HTTP interface on the LAN
// instead: same pictures, no cloud, but only from home.
//
// Channels are numbered <camera><stream>: camera 1's main stream is 101 and
// its sub-stream 102, camera 2 is 201/202. We use sub-streams — a 4K main
// stream is wasted on a tablet tile and far heavier to pull every second.
import crypto from "node:crypto";

const HOST = process.env.NVR_HOST || "";
const PORT = process.env.NVR_PORT || "80";
const USER = process.env.NVR_USER || "";
const PASSWORD = process.env.NVR_PASSWORD || "";

// "1:Gate,2:Driveway,3:Garden" -> [{ camera: 1, name: "Gate" }, ...]
export function cameras() {
  return (process.env.NVR_CAMERAS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [num, ...rest] = entry.split(":");
      const camera = Number(num);
      if (!Number.isInteger(camera) || camera < 1) return null;
      return { camera, name: rest.join(":").trim() || `Camera ${camera}` };
    })
    .filter(Boolean);
}

export function isEnabled() {
  return Boolean(HOST && USER && PASSWORD && cameras().length);
}

const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");

// Hikvision authenticates with HTTP Digest, which fetch() does not implement:
// the first request is expected to fail with a challenge, and the real request
// carries an MD5 response derived from it.
function digestHeader(challenge, method, uri) {
  const parts = {};
  for (const m of challenge.matchAll(/(\w+)="?([^",]+)"?/g)) parts[m[1]] = m[2];

  const { realm, nonce, qop, opaque, algorithm } = parts;
  const ha1 = md5(`${USER}:${realm}:${PASSWORD}`);
  const ha2 = md5(`${method}:${uri}`);

  // qop=auth adds a client nonce and a request counter to stop replay.
  const cnonce = crypto.randomBytes(8).toString("hex");
  const nc = "00000001";
  const response = qop
    ? md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${nonce}:${ha2}`);

  const fields = [
    `username="${USER}"`,
    `realm="${realm}"`,
    `nonce="${nonce}"`,
    `uri="${uri}"`,
    `response="${response}"`,
  ];
  if (qop) fields.push(`qop=${qop}`, `nc=${nc}`, `cnonce="${cnonce}"`);
  if (opaque) fields.push(`opaque="${opaque}"`);
  if (algorithm) fields.push(`algorithm=${algorithm}`);
  return `Digest ${fields.join(", ")}`;
}

async function isapi(path, { timeout = 6000 } = {}) {
  if (!isEnabled()) throw new Error("NVR is not configured");
  const url = `http://${HOST}:${PORT}${path}`;
  const signal = AbortSignal.timeout(timeout);

  // Some firmware answers Basic instead; try the unauthenticated request first
  // and follow whatever challenge comes back.
  let res = await fetch(url, { signal, cache: "no-store" });
  if (res.status === 401) {
    const challenge = res.headers.get("www-authenticate") || "";
    const auth = /^digest/i.test(challenge)
      ? digestHeader(challenge, "GET", path)
      : `Basic ${Buffer.from(`${USER}:${PASSWORD}`).toString("base64")}`;
    res = await fetch(url, { headers: { Authorization: auth }, signal, cache: "no-store" });
  }

  if (res.status === 401) throw new Error("NVR rejected the credentials");
  if (!res.ok) throw new Error(`NVR returned ${res.status}`);
  return res;
}

// A single still from one camera's sub-stream.
export async function snapshot(camera) {
  const res = await isapi(`/ISAPI/Streaming/channels/${camera}02/picture`);
  const type = res.headers.get("content-type") || "";
  // A misconfigured device answers 200 with an XML error rather than an image.
  if (!type.startsWith("image/")) {
    throw new Error("NVR did not return an image — check ISAPI is enabled");
  }
  return Buffer.from(await res.arrayBuffer());
}

// Used by the settings check: proves the address, credentials and ISAPI access
// all work, without pulling video.
export async function deviceInfo() {
  const res = await isapi("/ISAPI/System/deviceInfo");
  const xml = await res.text();
  const pick = (tag) => (xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) || [])[1] || null;
  return {
    name: pick("deviceName"),
    model: pick("model"),
    firmware: pick("firmwareVersion"),
    channels: Number(pick("videoInputPortNums")) || null,
  };
}
