// The only file that knows the SOS alert travels over Telegram.
//
// Kept deliberately narrow so the channel can be swapped without touching the
// button, the route, or anything else. Telegram was chosen because it needs no
// business account, no template approval and no 24-hour messaging window, and
// because a bot token is the whole setup.
//
// Config lives in .env.local (gitignored, so it does not travel with a pull):
//
//   TELEGRAM_BOT_TOKEN=      from @BotFather
//   TELEGRAM_SOS_CHAT_ID=    negative number for a group
//
// The token can post as the bot to anyone who has started a chat with it, so
// it is a password. It is read here and nowhere else, and never goes into an
// error message — Telegram's API puts it in the URL, so error text must never
// carry a URL.

const API = "https://api.telegram.org";
const TIMEOUT = 8000;

function creds() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_SOS_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

export function isConfigured() {
  return Boolean(creds());
}

async function call(method, body) {
  const c = creds();
  if (!c) throw new Error("Telegram is not configured");

  const isForm = body instanceof FormData;
  let res;
  try {
    res = await fetch(`${API}/bot${c.token}/${method}`, {
      method: "POST",
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: isForm ? body : JSON.stringify(body),
      // Next.js patches global fetch and caches it. Polling for replies means
      // sending the same request over and over, which it happily serves from
      // cache — the replies then appear only when the cache revalidates,
      // arriving minutes late. Nothing here is ever safe to cache.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch {
    // Offline, DNS failure, timeout. Deliberately vague — the caller only
    // needs to know it did not arrive, and the URL must not leak.
    throw new Error("Could not reach Telegram");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body — fall through to the status check */
  }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.description || `Telegram refused the message (${res.status})`);
  }
  return data.result;
}

export async function sendMessage(text) {
  const c = creds();
  if (!c) throw new Error("Telegram is not configured");
  return call("sendMessage", { chat_id: c.chatId, text, parse_mode: "HTML" });
}

export async function sendPhoto(bytes, caption) {
  const c = creds();
  if (!c) throw new Error("Telegram is not configured");
  const form = new FormData();
  form.set("chat_id", c.chatId);
  if (caption) form.set("caption", caption);
  form.set("photo", new Blob([bytes], { type: "image/jpeg" }), "camera.jpg");
  return call("sendPhoto", form);
}

// --- reading replies -------------------------------------------------------
//
// The parents answering the alert. Telegram cannot push to us — there is no
// public URL here for a webhook — so the laptop asks instead, and the tablet
// asks the laptop.
//
// This works only because the bot is an *administrator* of the group. A plain
// member bot with privacy mode on is shown nothing but commands aimed at it,
// and would never see a word of the reply.
//
// `offset` is a cursor: acknowledging an update deletes it from Telegram's
// queue, so each message is read exactly once. There is a single cursor per
// bot, which means opening the getUpdates URL in a browser during a live alert
// would swallow the replies before the tablet ever sees them.

// On globalThis for the same reason as lib/sosSession.js: a dev recompile
// re-instantiates the module, and a cursor that resets to zero would re-read
// messages that had already been acknowledged.
const g = globalThis;
g.__sosOffset ||= 0;

export async function pollMessages() {
  const c = creds();
  if (!c) return [];
  const updates = await call("getUpdates", {
    offset: g.__sosOffset,
    timeout: 0, // return at once; the tablet is already polling on its own clock
    allowed_updates: ["message"],
  });

  const out = [];
  for (const u of updates || []) {
    if (u.update_id >= g.__sosOffset) g.__sosOffset = u.update_id + 1;
    const m = u.message;
    if (!m) continue;
    if (String(m.chat?.id) !== String(c.chatId)) continue; // never leak another chat in
    if (m.from?.is_bot) continue; // our own alert coming back round

    // A photo arrives in several sizes; the last is the largest. Sent as a
    // file instead it comes through as a document, uncompressed — which is
    // what you want for anything you might print, so both are accepted.
    const photo = Array.isArray(m.photo) && m.photo.length ? m.photo[m.photo.length - 1] : null;
    const doc = m.document && /^image\//.test(m.document.mime_type || "") ? m.document : null;
    const file = photo || doc;

    if (!m.text && !file) continue; // a sticker, a location, something we do not handle

    out.push({
      userId: String(m.from?.id || ""),
      name: m.from?.first_name || "Someone",
      text: m.text || "",
      caption: m.caption || "",
      file: file ? { id: file.file_id, size: file.file_size || 0, compressed: Boolean(photo) } : null,
      at: (m.date || 0) * 1000,
    });
  }
  return out;
}

// Fetch a file the bot has been sent. Two steps: ask where it lives, then
// download it from the file endpoint. Both carry the token in the URL, so
// neither may appear in an error message.
export async function downloadFile(fileId) {
  const c = creds();
  if (!c) throw new Error("Telegram is not configured");

  const meta = await call("getFile", { file_id: fileId });
  const path = meta?.file_path;
  if (!path) throw new Error("Telegram did not say where the file is");

  let res;
  try {
    res = await fetch(`${API}/file/bot${c.token}/${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000), // a photo is bigger than a message
    });
  } catch {
    throw new Error("Could not download the file");
  }
  if (!res.ok) throw new Error(`Telegram refused the file (${res.status})`);
  return { bytes: Buffer.from(await res.arrayBuffer()), path };
}
