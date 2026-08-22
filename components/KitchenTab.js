"use client";

import { useEffect, useState } from "react";

// MyKitchen — recipes from the RecipyAI project, fetched server-side so no
// credentials or account details reach the tablet. Two views: the library,
// and one recipe opened for cooking.
export default function KitchenTab() {
  const [state, setState] = useState({ status: "loading" });
  const [recipe, setRecipe] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/kitchen/recipes")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.error) setState({ status: "error", error: d.error });
        else if (d.enabled === false) setState({ status: "unconfigured" });
        else setState({ status: "ready", recipes: d.recipes || [] });
      })
      .catch((e) => alive && setState({ status: "error", error: e.message }));
    return () => {
      alive = false;
    };
  }, []);

  function open(id) {
    setLoadingId(id);
    fetch(`/api/kitchen/recipes/${id}`)
      .then((r) => r.json())
      .then((d) => (d.recipe ? setRecipe(d.recipe) : setState({ status: "error", error: d.error })))
      .catch((e) => setState({ status: "error", error: e.message }))
      .finally(() => setLoadingId(null));
  }

  if (recipe) return <RecipeView recipe={recipe} onBack={() => setRecipe(null)} />;

  return (
    <div className="space-y-5">
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

// One recipe, laid out for reading at arm's length while cooking.
function RecipeView({ recipe, onBack }) {
  return (
    <div className="space-y-5">
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
        <button
          onClick={onBack}
          className="text-xs font-800 text-clay-600 bg-clay-400/15 px-3 py-1.5 rounded-full mb-4"
        >
          ← All recipes
        </button>

        <h2 className="font-display text-3xl font-600 text-ink-800 leading-tight">{recipe.title}</h2>
        <p className="text-sm text-ink-700/50 font-600 mt-1">
          {[recipe.cuisine, recipe.minutes ? `${recipe.minutes} min` : null,
            recipe.servings ? `serves ${recipe.servings}` : null].filter(Boolean).join(" · ")}
        </p>
        {recipe.summary && (
          <p className="text-sm text-ink-700/70 mt-3 leading-relaxed">{recipe.summary}</p>
        )}
      </section>

      <div className="grid gap-5 wall:grid-cols-3">
        <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
          <h3 className="font-display text-xl font-600 text-ink-800 mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((i, n) => (
              <li key={n} className="text-sm text-ink-800 leading-snug flex gap-2">
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
          <h3 className="font-display text-xl font-600 text-ink-800 mb-3">Method</h3>
          <ol className="space-y-3">
            {recipe.steps.map((s, n) => (
              <li key={n} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-sand-100 text-ink-700/60 font-800 text-xs flex items-center justify-center">
                  {n + 1}
                </span>
                <p className="text-sm text-ink-800 leading-relaxed flex-1">
                  {s.text}
                  {s.seconds ? (
                    <span className="text-ink-700/45 font-700"> · {Math.round(s.seconds / 60)} min</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>

          {recipe.tips.length > 0 && (
            <>
              <h3 className="font-display text-lg font-600 text-ink-800 mt-6 mb-2">Tips</h3>
              <ul className="space-y-1.5">
                {recipe.tips.map((t, n) => (
                  <li key={n} className="text-sm text-ink-700/70 leading-relaxed">{t}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
