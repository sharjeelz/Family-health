// Register the bot's command menu, so nobody has to remember what to type.
//
//   node scripts/telegram-menu.mjs
//
// Telegram shows these under the "/" button in the chat, each with its
// description. Run it again after adding or renaming a command — the list
// replaces whatever was there before.

import fs from "node:fs";
import path from "node:path";

const COMMANDS = [
  { command: "call", description: "Start a video call — the tablet at home rings" },
  { command: "endcall", description: "End the video call" },
  { command: "meeting", description: "Video call minutes used this month, and whether anything is owed" },
];

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local here — run this from the project root.");
  process.exit(1);
}
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
  if (m) env[m[1]] = m[2].trim();
}
if (!env.TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setMyCommands`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ commands: COMMANDS }),
});
const body = await res.json();
// Never print the URL on failure — the token is in it.
if (!res.ok || !body.ok) {
  console.error("Telegram refused:", body.description || res.status);
  process.exit(1);
}

console.log("Command menu set:\n");
for (const c of COMMANDS) console.log(`  /${c.command.padEnd(8)} ${c.description}`);
console.log("\nTap the / button in the chat to see them.");
