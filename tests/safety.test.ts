import { describe, it, expect } from "vitest";
import { Guard } from "../src/safety.js";
import type { Config } from "../src/config.js";

const cfg = (readOnly: boolean, allowDestructive: boolean): Config => ({
  pages: [],
  preferred: [],
  readOnly,
  allowDestructive,
  requestTimeoutMs: 30_000,
  userAgent: "test",
});

describe("Guard", () => {
  it("refuses writes by default, and names the variable that enables them", () => {
    const g = new Guard(cfg(true, false));
    expect(() => g.requireWrite("Posting")).toThrow(/FACEBOOK_ALLOW_WRITE/);
  });

  it("allows writes once enabled", () => {
    const g = new Guard(cfg(false, false));
    expect(() => g.requireWrite("Posting")).not.toThrow();
  });

  it("still refuses deletes when only writing is enabled", () => {
    // Deleting is the one action with no undo, so enabling writes must not
    // quietly enable it too.
    const g = new Guard(cfg(false, false));
    expect(() => g.requireDestructive("Deleting a post")).toThrow(/FACEBOOK_ALLOW_DELETE/);
  });

  it("refuses deletes when writing itself is off", () => {
    const g = new Guard(cfg(true, true));
    expect(() => g.requireDestructive("Deleting a post")).toThrow(/read-only/);
  });

  it("allows deletes when both are enabled", () => {
    const g = new Guard(cfg(false, true));
    expect(() => g.requireDestructive("Deleting a post")).not.toThrow();
  });

  it("never throws from auditing, even with no path configured", () => {
    const g = new Guard(cfg(false, false));
    expect(() => g.audit("create_post", "1", "hello")).not.toThrow();
  });
});
