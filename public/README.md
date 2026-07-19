# Assets folder

Files here are served from the site root (e.g. `public/adhan.mp3` → `/adhan.mp3`).

## Azaan audio (optional)

Drop an adhan audio file here named **`adhan.mp3`**:

```
public/adhan.mp3
```

At each prayer time the dashboard plays this file and shows a full-screen
reminder. **If the file is missing**, it plays a short gentle chime instead —
so everything still works without it. Use any adhan recording you have the
right to use.

## Family photos (optional)

Put your pictures in **`public/family/`**:

```
public/family/eid.jpg
public/family/park.jpg
```

Then list them in `lib/gallery.js`. They rotate on the **Home** tab.
