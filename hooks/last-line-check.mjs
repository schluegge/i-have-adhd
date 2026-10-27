// Stop hook: when always-on is enabled, the last line of every answer must be the
// next step marked 🤖 (agent), 🗿🚨 (human) or 👋 (handoff); see SKILL.md rule 3.
// Uses Claude Code's documented Stop contract: exit 2 + stderr sends the reason
// back to the model for one more turn. stop_hook_active prevents loops.
// Never blocks on its own failure.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

try {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  if (!fs.existsSync(path.join(claudeDir, ".i-have-adhd-always"))) process.exit(0);

  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  if (input.stop_hook_active) process.exit(0);

  const lines = String(input.last_assistant_message || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) process.exit(0);

  const last = lines[lines.length - 1].replace(/^[>*_\s]+/, "");
  if (/^(🤖|🗿🚨|👋)/u.test(last)) process.exit(0);

  process.stderr.write(
    "i-have-adhd rule 3: the last line of your answer must be the single next step, " +
      "starting with 🤖 (you do it), 🗿🚨 (only the reader can do it) or 👋 (task done: tell the reader to /handoff). " +
      "Reply with only that one line now; do not repeat the answer.\n",
  );
  process.exit(2);
} catch {
  process.exit(0);
}
