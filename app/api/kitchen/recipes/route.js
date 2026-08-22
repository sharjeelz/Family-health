import { listRecipes, isEnabled } from "../../../../lib/recipyai";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isEnabled()) return Response.json({ enabled: false, recipes: [] });
  try {
    return Response.json({ enabled: true, recipes: await listRecipes() });
  } catch (err) {
    return Response.json({ enabled: true, error: err.message }, { status: 503 });
  }
}
