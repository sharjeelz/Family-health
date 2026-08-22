import { getState as greeState, setState as greeSet, isEnabled as greeEnabled } from "../../../lib/gree";
import { listUnits as hisenseList, setUnit as hisenseSet, isEnabled as hisenseEnabled } from "../../../lib/hisense";

export const dynamic = "force-dynamic";

const GREE_ID = "gree";

// Both makes are gathered in parallel, and each is allowed to fail on its own:
// the Gree is on the LAN, the Hisense behind a cloud service, and one being
// unreachable must not blank out the other.
async function collect() {
  const [gree, hisense] = await Promise.allSettled([
    greeEnabled() ? greeState() : Promise.resolve(null),
    hisenseEnabled() ? hisenseList() : Promise.resolve([]),
  ]);

  const units = [];
  if (gree.status === "fulfilled" && gree.value) {
    units.push({ id: GREE_ID, kind: "gree", label: process.env.AC_LABEL || "Air conditioner",
                 tempMin: 16, tempMax: 30, online: true, ...gree.value });
  } else if (gree.status === "rejected") {
    units.push({ id: GREE_ID, kind: "gree", label: process.env.AC_LABEL || "Air conditioner",
                 error: gree.reason?.message || "unreachable" });
  }

  if (hisense.status === "fulfilled") units.push(...hisense.value);
  else units.push({ id: "hisense", kind: "hisense", label: "Air conditioner",
                    error: hisense.reason?.message || "unreachable" });

  return units;
}

export async function GET() {
  return Response.json({ units: await collect() });
}

export async function POST(request) {
  try {
    const { id, patch } = await request.json();
    if (!id || !patch) return Response.json({ error: "id and patch are required" }, { status: 400 });

    const unit =
      id === GREE_ID
        ? { id: GREE_ID, kind: "gree", label: process.env.AC_LABEL || "Air conditioner",
            tempMin: 16, tempMax: 30, online: true, ...(await greeSet(patch)) }
        : await hisenseSet(id, patch);

    return Response.json({ unit });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
