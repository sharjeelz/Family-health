# Family Dashboard

A fridge-mounted family command center for a tablet. Live hero (greeting, clock, date, auto-location weather) plus tabbed tools. Built with Next.js + Tailwind. Runs on the home network — no cloud, no API keys.

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

## Run it (local only)

This runs on your own machine and is served to the tablet over your wifi — there
is no cloud deploy. The school calendar reads from the Docker MySQL on the other
laptop, which is only reachable on the LAN.

```bash
npm install
npm run dev              # http://localhost:3000 — hot reload while editing
# or, for the always-on fridge tablet:
npm run build && npm start
```

Both bind to `0.0.0.0`, so from the tablet open **http://<this-machine-ip>:3000**
(currently `192.168.8.6`), then "Add to Home Screen" for a kiosk-like dashboard.

Windows Firewall will ask to allow Node on the private network the first time —
say yes, or the tablet gets a timeout.

## Database (MySQL on the LAN)

Connection settings live in `.env.local` (gitignored):

```
MYSQL_HOST=192.168.8.19     # Docker MySQL on the other laptop
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=...
MYSQL_DATABASE=family_health
```

- `lib/db.js` — shared connection pool. **Server-side only** — never import it
  from a `"use client"` component.
- `app/api/school-calendar/route.js` — serves the calendar rows to the browser.
- `scripts/seed-school-calendar.mjs` — creates the `family_health` database and
  the `school_calendar` table, then seeds it from `lib/calendar.js`. Idempotent,
  so re-run it whenever you edit that file:

  ```bash
  node scripts/seed-school-calendar.mjs
  ```

If the other laptop is off, the Study tab shows "Database unreachable" instead of
breaking — everything else keeps working.

## Setting it up on the always-on laptop

The dashboard is meant to live on the same laptop as the MySQL container
(`192.168.8.19`), so only one machine has to stay awake for the fridge tablet.
On that laptop:

```bash
git clone https://github.com/sharjeelz/Family-health.git
cd Family-health
npm install
cp .env.example .env.local        # then set MYSQL_PASSWORD
```

Because MySQL is now on the *same* box, `.env.local` should say
`MYSQL_HOST=127.0.0.1` — not the LAN IP.

```bash
node scripts/seed-school-calendar.mjs   # only needed the first time
npm run build && npm start
```

The tablet then opens **http://192.168.8.19:3000**. Allow Node through the
firewall on the private network when prompted, or the tablet times out.

To pick up later changes: `git pull && npm install && npm run build && npm start`.

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
