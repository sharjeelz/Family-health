"use client";

import { useCallback, useEffect, useState } from "react";
import KitchenSearch from "./KitchenSearch";
import { fetchJson } from "../lib/fetchJson";

// MyKitchen — recipes from the RecipyAI project, fetched server-side so no
// credentials or account details reach the tablet. Two views: the library,
// and one recipe opened for cooking.
export default function KitchenTab() {
  const [state, setState] = useState({ status: "loading" });
  const [recipe, setRecipe] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchJson("/api/kitchen/recipes")
      .then((d) => {
        if (!alive) return;
        if (d.enabled === false) setState({ status: "unconfigured" });
        else setState({ status: "ready", recipes: d.recipes || [] });
      })
      .catch((e) => alive && setState({ status: "error", error: e.message }));
    return () => {
      alive = false;
    };
  }, []);

  const open = useCallback(function open(id) {
    setLoadingId(id);
    fetchJson(`/api/kitchen/recipes/${id}`)
      .then((d) => setRecipe(d.recipe))
      .catch((e) => setState({ status: "error", error: e.message }))
      .finally(() => setLoadingId(null));
  }, []);

  if (recipe) return <RecipeView recipe={recipe} onBack={() => setRecipe(null)} />;

  return (
    <div className="space-y-5">
      {state.status !== "unconfigured" && <KitchenSearch onOpenRecipe={open} />}

      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-600 text-ink-800 mb-1">My kitchen</h2>
        <p className="text-sm text-ink-700/55 mb-4">Recipes saved in RecipyAI.</p>

        {state.status === "loading" && (
          <p className="text-center text-ink-700/45 text-sm py-6">Loading…</p>
        )}

        {state.status === "unconfigured" && (
          <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center">
            <p className="text-sm font-700 text-ink-800">Not connected yet</p>
            <p className="text-sm text-ink-700/55 mt-1 leading-snug">
              Set RECIPYAI_URL, RECIPYAI_EMAIL and RECIPYAI_PASSWORD in .env.local,
              with the RecipyAI backend running.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center">
            <p className="text-sm font-700 text-ink-800">Can't reach RecipyAI</p>
            <p className="text-sm text-ink-700/55 mt-1">{state.error}</p>
          </div>
        )}

        {state.status === "ready" && state.recipes.length === 0 && (
          <p className="text-center text-ink-700/45 text-sm py-6">No recipes saved yet.</p>
        )}

        {state.status === "ready" && state.recipes.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 wall:grid-cols-3">
            {state.recipes.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => open(r.id)}
                  disabled={loadingId === r.id}
                  className="w-full text-left rounded-2xl bg-sand-50 border border-sand-200 overflow-hidden hover:border-clay-400 active:scale-[0.99] transition disabled:opacity-50"
                >
                  {r.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnail} alt="" className="w-full h-28 object-cover" />
                  )}
                  <div className="p-3.5">
                    <p className="font-800 text-sm text-ink-800 leading-snug">{r.title}</p>
                    <p className="text-xs text-ink-700/50 font-600 mt-1">
                      {[r.cuisine, r.minutes ? `${r.minutes} min` : null].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Pull the video id out of whatever form the source URL takes — watch links,
// youtu.be, shorts and embeds all appear depending on where the recipe came
// from. Anything else is not YouTube and just gets a plain link.
function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (!host.endsWith("youtube.com")) return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(shorts|embed|v)\/([^/?]+)/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

// The video the recipe came from. The iframe is only created once the poster
// is tapped: otherwise every recipe you open would start loading YouTube in
// the background, on a screen that is on all day.
function VideoPlayer({ url, poster, title }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);

  if (!id) {
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-xs font-800 text-clay-600 bg-clay-400/15 px-3 py-1.5 rounded-full"
      >
        Open the source ↗
      </a>
    ) : null;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-ink-800 aspect-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title || "Recipe video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          aria-label="Play the recipe video"
          className="absolute inset-0 w-full h-full group"
        >
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-card group-hover:scale-105 transition">
              <span className="ml-1 border-y-[11px] border-y-transparent border-l-[18px] border-l-ink-800" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

// One recipe, laid out for reading at arm's length while cooking. Can be read
// in Urdu: RecipyAI translates on demand and caches it, so the wait only
// happens the first time a recipe is opened in a given language.
function RecipeView({ recipe, onBack }) {
  const [urdu, setUrdu] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [showUrdu, setShowUrdu] = useState(false);

  function toggleUrdu() {
    if (urdu) return setShowUrdu((v) => !v);
    setTranslating(true);
    setError(null);
    fetchJson(`/api/kitchen/recipes/${recipe.id}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "ur" }),
    })
      .then((d) => {
        if (!d.translation) throw new Error("translation came back empty");
        setUrdu(d.translation);
        setShowUrdu(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setTranslating(false));
  }

  // Everything below reads from `view`, so the two languages share one layout.
  const view = showUrdu && urdu ? urdu : recipe;
  const ur = showUrdu && Boolean(urdu);
  const rtl = ur ? { dir: "rtl", lang: "ur" } : {};
  const urFont = ur ? "font-urdu leading-loose" : "";

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={onBack}
            className="text-xs font-800 text-clay-600 bg-clay-400/15 px-3 py-1.5 rounded-full"
          >
            ← All recipes
          </button>
          <button
            onClick={toggleUrdu}
            disabled={translating}
            aria-pressed={ur}
            className={`text-xs px-3.5 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
              ur ? "bg-sage-500 text-white font-800" : "bg-sand-100 text-ink-700/60 font-urdu"
            }`}
          >
            {translating ? "…" : ur ? "English" : "اردو"}
          </button>
        </div>

        {error && <p className="text-clay-600 font-700 text-xs mb-3">{error}</p>}

        <h2
          {...rtl}
          className={`text-3xl text-ink-800 leading-tight ${ur ? "font-urdu leading-[1.9]" : "font-display font-600"}`}
        >
          {view.title}
        </h2>
        <p className="text-sm text-ink-700/50 font-600 mt-1">
          {[view.cuisine, view.minutes ? `${view.minutes} min` : null,
            view.servings ? `serves ${view.servings}` : null].filter(Boolean).join(" · ")}
        </p>
        {view.summary && (
          <p {...rtl} className={`text-sm text-ink-700/70 mt-3 ${ur ? urFont : "leading-relaxed"}`}>
            {view.summary}
          </p>
        )}

        {/* The original video — handy for the bits a written method loses. */}
        <div className="mt-4">
          <VideoPlayer url={recipe.sourceUrl} poster={recipe.thumbnail} title={recipe.title} />
        </div>
      </section>

      <div className="grid gap-5 wall:grid-cols-3">
        <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
          <h3 className={`text-xl text-ink-800 mb-3 ${ur ? "font-urdu" : "font-display font-600"}`}>
            {ur ? "اجزاء" : "Ingredients"}
          </h3>
          <ul className="space-y-2" {...rtl}>
            {view.ingredients.map((i, n) => (
              <li key={n} className={`text-sm text-ink-800 flex gap-2 ${ur ? urFont : "leading-snug"}`}>
                <span className="text-clay-600 font-800 shrink-0">
                  {[i.quantity, i.unit].filter(Boolean).join(" ")}
                </span>
                <span>
                  {i.item}
                  {i.notes && <span className="text-ink-700/45"> · {i.notes}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 wall:col-span-2">
          <h3 className={`text-xl text-ink-800 mb-3 ${ur ? "font-urdu" : "font-display font-600"}`}>
            {ur ? "ترکیب" : "Method"}
          </h3>
          <ol className="space-y-3" {...rtl}>
            {view.steps.map((s, n) => (
              <li key={n} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-sand-100 text-ink-700/60 font-800 text-xs flex items-center justify-center">
                  {n + 1}
                </span>
                <p className={`text-sm text-ink-800 flex-1 ${ur ? urFont : "leading-relaxed"}`}>
                  {s.text}
                  {s.seconds ? (
                    <span className="text-ink-700/45 font-700"> · {Math.round(s.seconds / 60)} min</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>

          {view.tips.length > 0 && (
            <>
              <h3 className={`text-lg text-ink-800 mt-6 mb-2 ${ur ? "font-urdu" : "font-display font-600"}`}>
                {ur ? "مشورے" : "Tips"}
              </h3>
              <ul className="space-y-1.5" {...rtl}>
                {view.tips.map((t, n) => (
                  <li key={n} className={`text-sm text-ink-700/70 ${ur ? urFont : "leading-relaxed"}`}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
