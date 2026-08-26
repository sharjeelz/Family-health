// One reader for the bot, shared by every feature that needs it.
//
// This exists because getUpdates has a single cursor per bot: acknowledging an
// update deletes it. Two features polling independently would steal each
// other's messages at random — an SOS reply would vanish into the call
// listener and never reach the child waiting for it.
//
// So nothing polls Telegram directly any more. This drains once and hands the
// messages to everyone who cares.

import { pollMessages } from "./telegram";
import { record } from "./sosSession";
import { noteCall } from "./callSession";
import { handleCommands } from "./commands";

const g = globalThis;

export async function drain() {
  // Two routes poll on their own clocks and will overlap. Share one request
  // rather than racing two, which would again split the messages between them.
  if (g.__tgDrain) return g.__tgDrain;

  g.__tgDrain = (async () => {
    try {
      const messages = await pollMessages();
      if (messages.length) {
        record(messages); // ignored unless an alert is running
        noteCall(messages);
        // Not awaited: a command answers over the network, and the tablet
        // polls this every few seconds. Waiting on it would slow every poll
        // for the sake of the rare message that is a command.
        handleCommands(messages).catch((err) =>
          console.log("[commands] failed:", err.message),
        );
      }
    } finally {
      g.__tgDrain = null;
    }
  })();

  return g.__tgDrain;
}
