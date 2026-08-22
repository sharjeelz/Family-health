import { query } from "../../../lib/db";

// Never cache — the tablet should see calendar edits made on the DB right away.
export const dynamic = "force-dynamic";

export async function GET(request) {
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit")) || 50, 200);
  try {
    const rows = await query(
      `SELECT id, title, start_date, end_date, category, child_id, notes
         FROM school_calendar
        ORDER BY start_date ASC
        LIMIT ?`,
      [limit]
    );
    return Response.json({ ok: true, count: rows.length, events: rows });
  } catch (err) {
    // The LAN MySQL may simply be off — surface it instead of crashing the tab.
    return Response.json({ ok: false, error: err.code || err.message }, { status: 503 });
  }
}
