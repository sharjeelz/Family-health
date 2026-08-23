import { cameras, isEnabled, deviceInfo } from "../../../lib/nvr";

export const dynamic = "force-dynamic";

// Which cameras exist, and whether the recorder is actually reachable. The
// tab asks once on open rather than discovering failure tile by tile.
export async function GET() {
  if (!isEnabled()) return Response.json({ enabled: false, cameras: [] });
  try {
    const info = await deviceInfo();
    return Response.json({ enabled: true, cameras: cameras(), device: info });
  } catch (err) {
    return Response.json({ enabled: true, cameras: cameras(), error: err.message });
  }
}
