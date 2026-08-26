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
