// Commands the parents can send to the family group.
//
// Everything here answers back into the group rather than onto the tablet: the
// person asking is usually out of the house, which is the whole point.

import { usage } from "./daily";
import { sendMessage } from "./telegram";

export async function handleCommands(messages) {
  for (const m of messages) {
    if (!/^\/meeting\b/i.test((m.text || "").trim())) continue;

    try {
      const u = await usage();
      const left = u.allowance - u.month;
      await sendMessage(
        [
          "<b>Video calls this month</b>",
          `Used: ${u.month.toFixed(1)} of ${u.allowance} minutes`,
          `Left: ${left.toFixed(1)}`,
          `Calls: ${u.sessions}`,
          "",
          left > 0 ? "Nothing to pay." : "Over the allowance — $0.004 per extra minute.",
        ].join("\n"),
      );
    } catch (err) {
      // Say so rather than leaving them staring at a group that never answers.
      await sendMessage(`Could not read the usage — ${err.message}`).catch(() => {});
    }
  }
}
