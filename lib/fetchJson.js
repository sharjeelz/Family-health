"use client";

// fetch + parse, but survive the server answering with something that isn't
// JSON. Next serves an HTML error page while a route is compiling or when it
// crashes, and a bare response.json() turns that into the baffling
// "Unexpected token '<'". Report what actually happened instead.
export async function fetchJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new Error("Can't reach the dashboard server");
  }

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      res.ok
        ? "The server sent an unexpected response — it may still be starting up."
        : `Server error ${res.status} — check the dashboard log.`
    );
  }

  if (body?.error) throw new Error(body.error);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return body;
}
