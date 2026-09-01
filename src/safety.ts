/**
 * What a tool is allowed to do.
 *
 * A Page post is public the moment it lands and is visible to everyone who
 * follows that Page. Deleting one is worse: it cannot be undone. Those are two
 * different levels of risk, so they are two different switches.
 */

import { appendFileSync } from "node:fs";
import type { Config } from "./config.js";

export class Guard {
  constructor(private cfg: Config) {}

  /** Anything that changes what the public sees. */
  requireWrite(action: string): void {
    if (this.cfg.readOnly) {
      throw new Error(
        `${action} is disabled. This server is read-only unless FACEBOOK_ALLOW_WRITE=true is set.`,
      );
    }
  }

  /** Anything that cannot be undone. */
  requireDestructive(action: string): void {
    this.requireWrite(action);
    if (!this.cfg.allowDestructive) {
      throw new Error(
        `${action} cannot be undone and is disabled. Set FACEBOOK_ALLOW_DELETE=true to permit it.`,
      );
    }
  }

  get readOnly(): boolean {
    return this.cfg.readOnly;
  }

  /**
   * Append-only record of every write.
   *
   * No tool can read or edit this file, so it is a record the agent cannot
   * revise after the fact. The URL is never written, because the Page token
   * travels in it.
   */
  audit(action: string, pageId: string, detail: string): void {
    if (!this.cfg.auditPath) return;
    const line = [
      new Date().toISOString(),
      action,
      pageId,
      detail.replace(/\s+/g, " ").slice(0, 200),
    ].join("\t");
    try {
      appendFileSync(this.cfg.auditPath, line + "\n", { mode: 0o600 });
    } catch {
      /* auditing must never break the action it is recording */
    }
  }
}
