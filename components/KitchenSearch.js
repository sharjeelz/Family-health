"use client";

import { useEffect, useRef, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

const STATUS_LABEL = {
  queued: "Queued…",
  transcribing: "Transcribing the video…",
  structuring: "Writing up the recipe…",
};

function duration(seconds) {
  if (!seconds) return null;
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

// Find a cooking video and turn it into a recipe. Extraction runs as a job on
// the RecipyAI worker — transcription plus an LLM pass — so it takes minutes,
// not seconds, and we poll until it lands.
export default function KitchenSearch({ onOpenRecipe }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const [jobs, setJobs] = useState({}); // videoId -> {jobId, status, recipeId, error}
  const timers = useRef({});

  // Stop polling if the tab is closed mid-extraction.
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  function search(e) {
    e?.preventDefault();
    const query = q.trim();
    if (query.length < 2) return;
    setState({ status: "searching" });
    fetchJson(`/api/kitchen/search?q=${encodeURIComponent(query)}`)
      .then((d) => setState({ status: "ready", results: d.results }))
      .catch((e) => setState({ status: "error", error: e.message }));
  }

  function poll(videoId, jobId) {
    fetchJson(`/api/kitchen/jobs/${jobId}`)
      .then((d) => {
        const job = d.job;
        if (!job) throw new Error("lost track of the job");
        setJobs((prev) => ({ ...prev, [videoId]: { ...prev[videoId], ...job } }));
        if (job.status !== "done" && job.status !== "failed") {
          timers.current[videoId] = setTimeout(() => poll(videoId, jobId), 3000);
        }
      })
      .catch((e) =>
        setJobs((prev) => ({ ...prev, [videoId]: { ...prev[videoId], status: "failed", error: e.message } }))
      );
  }

  function extract(video) {
    setJobs((prev) => ({ ...prev, [video.videoId]: { status: "queued" } }));
    fetchJson("/api/kitchen/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: video.url }),
    })
      .then((d) => {
        if (!d.jobId) throw new Error("could not start the extraction");
        setJobs((prev) => ({ ...prev, [video.videoId]: { jobId: d.jobId, status: "queued" } }));
        poll(video.videoId, d.jobId);
      })
      .catch((e) =>
        setJobs((prev) => ({ ...prev, [video.videoId]: { status: "failed", error: e.message } }))
      );
  }

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6">
      <h2 className="font-display text-2xl font-600 text-ink-800 mb-1">Find a recipe</h2>
      <p className="text-sm text-ink-700/55 mb-4">
        Search cooking videos, then pull one into your library.
      </p>

      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="chicken karahi"
          className="flex-1 rounded-2xl bg-sand-50 border border-sand-200 px-4 py-3 text-sm text-ink-800 placeholder:text-ink-700/35 focus:outline-none focus:border-clay-400"
        />
        <button
          type="submit"
          disabled={q.trim().length < 2 || state.status === "searching"}
          className="rounded-2xl bg-ink-800 text-sand-50 font-800 text-sm px-5 disabled:opacity-40"
        >
          {state.status === "searching" ? "…" : "Search"}
        </button>
      </form>

      {state.status === "searching" && (
        <p className="text-center text-ink-700/45 text-sm py-6">Searching YouTube…</p>
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-5 text-center">
          <p className="text-sm font-700 text-ink-800">Search failed</p>
          <p className="text-sm text-ink-700/55 mt-1">{state.error}</p>
        </div>
      )}

      {state.status === "ready" && state.results.length === 0 && (
        <p className="text-center text-ink-700/45 text-sm py-6">Nothing found.</p>
      )}

      {state.status === "ready" && state.results.length > 0 && (
        <ul className="space-y-2">
          {state.results.map((v) => {
            const job = jobs[v.videoId];
            const busy = job && job.status !== "done" && job.status !== "failed";
            const doneId = job?.status === "done" ? job.recipeId : v.existingRecipeId;

            return (
              <li
                key={v.videoId}
                className="flex items-center gap-3 rounded-2xl bg-sand-50 border border-sand-200 p-2.5"
              >
                {v.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt="" className="w-24 h-16 object-cover rounded-xl shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-800 text-sm text-ink-800 leading-snug line-clamp-2">{v.title}</p>
                  <p className="text-xs text-ink-700/50 font-600 mt-0.5">
                    {[v.channel, duration(v.seconds)].filter(Boolean).join(" · ")}
                  </p>
                  {busy && (
                    <p className="text-xs text-clay-600 font-700 mt-1">
                      {STATUS_LABEL[job.status] || "Working…"}
                    </p>
                  )}
                  {job?.status === "failed" && (
                    <p className="text-xs text-clay-600 font-700 mt-1">{job.error || "Extraction failed"}</p>
                  )}
                </div>

                {doneId ? (
                  <button
                    onClick={() => onOpenRecipe(doneId)}
                    className="shrink-0 rounded-full bg-sage-500 text-white font-800 text-xs px-4 py-2"
                  >
                    Open
                  </button>
                ) : (
                  <button
                    onClick={() => extract(v)}
                    disabled={busy}
                    className="shrink-0 rounded-full bg-ink-800 text-sand-50 font-800 text-xs px-4 py-2 disabled:opacity-40"
                  >
                    {busy ? "…" : "Get recipe"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
