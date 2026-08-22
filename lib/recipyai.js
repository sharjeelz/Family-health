// Read-only client for RecipyAI (the separate C:\Dawul\RecipyAi-web project).
// SERVER ONLY — it holds an account's credentials and access token.
//
// That app's API requires a logged-in user for everything except a single
// share-token endpoint, so the dashboard signs in once as one account and does
// the fetching on the tablet's behalf. Nothing about the account reaches the
// browser, and RecipyAI itself is untouched: this only consumes its API.
//
// Set RECIPYAI_URL to enable; leave it blank and the MyKitchen tab hides.
const BASE = (process.env.RECIPYAI_URL || "").replace(/\/$/, "");
const EMAIL = process.env.RECIPYAI_EMAIL || "";
const PASSWORD = process.env.RECIPYAI_PASSWORD || "";

const TIMEOUT = 10000;

export function isEnabled() {
  return Boolean(BASE && EMAIL && PASSWORD);
}

// Tokens live on globalThis so dev hot reloads don't log in on every edit.
const g = globalThis;

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) {
    // Deliberately vague: this message can reach the browser.
    throw new Error(res.status === 401 ? "RecipyAI rejected the credentials" : `RecipyAI login failed (${res.status})`);
  }
  g._recipyaiTokens = await res.json();
  return g._recipyaiTokens;
}

async function refresh() {
  const refresh_token = g._recipyaiTokens?.refresh_token;
  if (!refresh_token) return login();
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  // A revoked or expired refresh token is normal; fall back to a full login.
  if (!res.ok) return login();
  g._recipyaiTokens = await res.json();
  return g._recipyaiTokens;
}

// Access tokens expire, and we are not told when. Rather than track the clock,
// treat a 401 as "refresh and try once more".
async function authed(path) {
  if (!isEnabled()) throw new Error("RecipyAI is not configured");
  const tokens = g._recipyaiTokens || (await login());

  const send = (t) =>
    fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${t.access_token}` },
      signal: AbortSignal.timeout(TIMEOUT),
      cache: "no-store",
    });

  let res = await send(tokens);
  if (res.status === 401) res = await send(await refresh());

  if (!res.ok) throw new Error(`RecipyAI returned ${res.status}`);
  return res.json();
}

// Only the fields the tablet renders — no owner ids, costs or model metadata.
function toSummary(r) {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    minutes: r.total_time_min,
    cuisine: r.cuisine,
    thumbnail: r.thumbnail_url,
    rating: r.my_rating,
    cooked: r.my_cooked_count,
  };
}

export async function listRecipes() {
  const rows = await authed("/recipes/mine");
  return rows.map(toSummary);
}

export async function getRecipe(id) {
  const r = await authed(`/recipes/${id}`);
  return {
    ...toSummary(r),
    servings: r.servings,
    sourceUrl: r.source_url,
    ingredients: (r.ingredients || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ quantity: i.quantity, unit: i.unit, item: i.item, notes: i.notes })),
    steps: (r.steps || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ text: s.text, seconds: s.duration_seconds })),
    tips: r.tips || [],
  };
}
