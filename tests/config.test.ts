import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, pickPage, type Config } from "../src/config.js";

const saved = { ...process.env };

beforeEach(() => {
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("FACEBOOK_")) delete process.env[k];
  }
});
afterEach(() => {
  process.env = { ...saved };
});

const cfg = (pages: Config["pages"], preferred: string[] = []): Config => ({
  pages,
  preferred,
  readOnly: true,
  allowDestructive: false,
  requestTimeoutMs: 30_000,
  userAgent: "test",
});

describe("loadConfig", () => {
  it("is read-only unless writing is explicitly allowed", () => {
    expect(loadConfig().readOnly).toBe(true);

    process.env.FACEBOOK_ALLOW_WRITE = "true";
    expect(loadConfig().readOnly).toBe(false);
  });

  it("keeps deleting separate from writing", () => {
    process.env.FACEBOOK_ALLOW_WRITE = "true";
    // Writing on must not imply deleting on: deleting is the only action here
    // with no undo.
    expect(loadConfig().allowDestructive).toBe(false);

    process.env.FACEBOOK_ALLOW_DELETE = "true";
    expect(loadConfig().allowDestructive).toBe(true);
  });

  it("reads a single page from the environment", () => {
    process.env.FACEBOOK_PAGE_ID = "123";
    process.env.FACEBOOK_PAGE_TOKEN = "tok";
    process.env.FACEBOOK_PAGE_NAME = "Test Page";

    const c = loadConfig();
    expect(c.pages).toHaveLength(1);
    expect(c.pages[0]).toMatchObject({ id: "123", accessToken: "tok", name: "Test Page" });
  });

  it("reads several pages from JSON", () => {
    process.env.FACEBOOK_PAGES = JSON.stringify([
      { id: "1", access_token: "a", name: "One" },
      { id: "2", accessToken: "b", name: "Two" },
    ]);

    const c = loadConfig();
    expect(c.pages.map((p) => p.name)).toEqual(["One", "Two"]);
  });

  it("ignores malformed JSON rather than crashing on startup", () => {
    process.env.FACEBOOK_PAGES = "{not json";
    expect(() => loadConfig()).not.toThrow();
  });
});

describe("pickPage", () => {
  const pages = [
    { id: "1", accessToken: "a", name: "Navid" },
    { id: "2", accessToken: "b", name: "Navid Media" },
    { id: "3", accessToken: "c", name: "Side Project" },
  ];

  it("says so clearly when nothing is connected", () => {
    expect(() => pickPage(cfg([]))).toThrow(/No Facebook Page connected/);
  });

  it("matches an exact name before a prefix", () => {
    // Without this rule "Navid Media" would swallow a request meant for
    // "Navid", because one is a prefix of the other.
    expect(pickPage(cfg(pages), "Navid").id).toBe("1");
    expect(pickPage(cfg(pages), "Navid Media").id).toBe("2");
  });

  it("matches by id", () => {
    expect(pickPage(cfg(pages), "3").name).toBe("Side Project");
  });

  it("is case insensitive", () => {
    expect(pickPage(cfg(pages), "side project").id).toBe("3");
  });

  it("lists what is connected when nothing matches", () => {
    expect(() => pickPage(cfg(pages), "Nope")).toThrow(/Navid, Navid Media, Side Project/);
  });

  it("uses the preference order when no page is named", () => {
    expect(pickPage(cfg(pages, ["Side Project"])).id).toBe("3");
  });

  it("falls back to the first page when no preference matches", () => {
    expect(pickPage(cfg(pages, ["Missing"])).id).toBe("1");
  });
});
