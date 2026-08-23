import { snapshot, isEnabled } from "../../../../lib/nvr";

export const dynamic = "force-dynamic";

// Proxies one still from the recorder. Going through the server keeps the
// DVR's address and password off the tablet, and means the browser only ever
// talks to its own origin.
export async function GET(_request, { params }) {
  if (!isEnabled()) return new Response("NVR is not configured", { status: 404 });

  const camera = Number(params.camera);
  if (!Number.isInteger(camera) || camera < 1) {
    return new Response("bad camera number", { status: 400 });
  }

  try {
    const jpeg = await snapshot(camera);
    return new Response(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        // Every request must hit the recorder; a cached frame is a lie.
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return new Response(err.message, { status: 503 });
  }
}
