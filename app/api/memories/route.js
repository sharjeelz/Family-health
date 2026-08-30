import { list } from "../../../lib/memories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ ok: true, memories: await list({}) });
  } catch (err) {
    // The database may simply be down — say so rather than blanking the tab.
    return Response.json({ ok: false, error: err.code || err.message }, { status: 503 });
  }
}
