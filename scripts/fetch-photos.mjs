// One-off helper: pulls a few freely-licensed mosque photos from Wikimedia
// Commons into public/family/ and prints their license info.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const QUERIES = [
  ["mosque-zayed", "Sheikh Zayed Grand Mosque courtyard panorama"],
  ["mosque-blue", "Blue Mosque Istanbul exterior sunset"],
  ["mosque-faisal", "Faisal Mosque Islamabad"],
];

const outDir = path.resolve("public/family");
await mkdir(outDir, { recursive: true });

const manifest = [];

for (const [slug, q] of QUERIES) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(q)}&gsrlimit=4&gsrnamespace=6` +
    "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400&format=json&origin=*";
  try {
    const res = await fetch(api, { headers: { "User-Agent": "family-dashboard/1.0 (personal)" } });
    const json = await res.json();
    const pages = Object.values(json.query?.pages || {})
      .sort((a, b) => (a.index || 0) - (b.index || 0));
    // pick the first landscape JPG (wider than tall, decent size)
    const hit = pages
      .map((p) => p.imageinfo?.[0])
      .find(
        (ii) =>
          ii &&
          /\.jpe?g$/i.test(ii.url) &&
          ii.thumbwidth >= 1000 &&
          ii.thumbwidth / ii.thumbheight >= 1.3 &&
          ii.thumbwidth / ii.thumbheight <= 2.2
      );
    if (!hit) {
      console.log(`SKIP  ${slug}: no suitable landscape image found`);
      continue;
    }
    const lic = hit.extmetadata?.LicenseShortName?.value || "?";
    const artist = (hit.extmetadata?.Artist?.value || "?").replace(/<[^>]+>/g, "").trim();
    const url = hit.thumburl || hit.url;
    const imgRes = await fetch(url, { headers: { "User-Agent": "family-dashboard/1.0 (personal)" } });
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const file = `${slug}.jpg`;
    await writeFile(path.join(outDir, file), buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`SAVED ${file}  (${kb} KB, ${hit.thumbwidth}x${hit.thumbheight})  license: ${lic}  by: ${artist}`);
    manifest.push({ src: `/family/${file}`, caption: q, license: lic, artist });
  } catch (e) {
    console.log(`ERROR ${slug}: ${e.message}`);
  }
}

await writeFile(path.join(outDir, "_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDONE. ${manifest.length} photos saved.`);
