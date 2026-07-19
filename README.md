# Family Dashboard

A fridge-mounted family command center for a tablet. Live hero (greeting, clock, date, auto-location weather) plus tabbed tools. Built with Next.js + Tailwind. Deploys to Vercel with zero config — no API keys needed.

## Tabs

- **Health** — daily meal plan (Pakistani home food), roti & rice guide, habit tracking, per-person water, weekly progress.
- **Namaz** — 5 live prayer times (Umm al-Qura method) with a next-prayer countdown, by your location.
- **Study** — placeholder that already switches by day; shows which books each child needs for *tomorrow*. Ready for your data (see below).
- **Reminders** — add / check off / delete family reminders. Saved on the device.

## Live data sources (free, no keys)

- **Weather:** Open-Meteo (`api.open-meteo.com`) + reverse geocoding for the city name.
- **Prayer times:** Aladhan (`api.aladhan.com`), method 4 = Umm al-Qura.

Both ask for the browser's location once. If the user denies it, they fall back to Riyadh. To change the fallback, edit the coordinates in `lib/useWeather.js` and `lib/usePrayerTimes.js`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy to Vercel

Push to GitHub → import at vercel.com/new → Deploy. Or run `vercel` in this folder.

**Tablet tip:** open the deployed URL on the tablet, then "Add to Home Screen" for a full-screen, kiosk-like dashboard.

## Adding your own data

Everything editable lives in **`lib/plan.js`**:

- **Meals:** the `WEEK` array — one entry per weekday (0 = Sunday). Swap any meal freely.
- **Study plan (fill this in later):** the `STUDY` object, keyed by weekday index, then child id. Example:
  ```js
  export const STUDY = {
    0: { son: ["Math", "Science"], daughter: ["English", "Art"] }, // Sunday
    1: { son: ["Urdu", "Islamiat"], daughter: ["Math"] },          // Monday
    // ...
  };
  ```
  The Study tab automatically shows *tomorrow's* books so they can be packed the night before. Leave arrays empty (`[]`) for holidays.
- **Children:** the `CHILDREN` array (names/emojis).
- **Habits, water goal, tips:** `HABITS`, `WATER_GOAL`, `TIPS`.

## Adding new tabs later

The app is built to grow. To add a tab (e.g. Azaan audio, chores, calendar):
1. Create a component in `components/`.
2. Import it in `app/page.js`, add an entry to the `TABS` array, and render it in the tab switch.

## Tech

Next.js 14 (App Router) · Tailwind CSS · client-side `localStorage` · Open-Meteo & Aladhan public APIs.
