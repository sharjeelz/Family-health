import { getState, setState } from "../../../lib/gree";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getState());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    return Response.json(await setState(await request.json()));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
