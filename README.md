# Family Dashboard

A fridge-mounted family command center for a tablet. Live hero (greeting, clock, date, auto-location weather) plus tabbed tools. Built with Next.js + Tailwind. Deploys to Vercel with zero config — no API keys needed.

## Tabs

- **Home** — the ambient landing screen: a rotating family photo and the **ayah of the day** (a curated, meaningful verse chosen by the calendar day — not random).
- **Health** — daily meal plan (Pakistani home food), roti & rice guide, habit tracking, per-person water, weekly progress.
- **Namaz** — 5 live prayer times (Umm al-Qura method) with a next-prayer countdown, by your location. Includes an **Azaan alert** (with Test button + on/off toggle).
- **Study** — placeholder that already switches by day; shows which books each child needs for *tomorrow*. Ready for your data (see below).
- **Grocery** — add / check off / delete shopping items, plus one-tap "staples" pulled from the meal plan. Saved on the device.
- **Reminders** — add / check off / delete family reminders. Saved on the device.

## Azaan alert & family photos (optional assets)

- **Azaan audio:** drop an `adhan.mp3` into `public/`. At each prayer time the app plays it and shows a full-screen reminder with a mosque image. **No file?** It plays a gentle chime instead — still works. Toggle it on/off or preview it with **Test** on the Namaz tab.
- **Family photos:** put pictures in `public/family/` and list them in `lib/gallery.js`. They rotate on the Home tab.
- **Ayah of the day:** the curated verse list lives in `lib/ayat.js` — add or edit verses there.

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
