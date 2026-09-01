/**
 * Say what is wrong, in the order it needs fixing.
 *
 * Most setup failures here are a missing permission or an expired token, and
 * Meta's own error for both is unhelpful. This checks each link in the chain
 * and reports the first one that is broken.
 */

import { GRAPH_BASE, type Config } from "./config.js";

export async function doctor(cfg: Config): Promise<void> {
  const say = (s: string) => process.stderr.write(s + "\n");

  say(`facebook-mcp doctor`);
  say(`  pages connected:  ${cfg.pages.length}`);
  say(`  writes:           ${cfg.readOnly ? "disabled" : "enabled"}`);
  say(`  deletes:          ${cfg.allowDestructive ? "enabled" : "disabled"}`);
  say(`  audit log:        ${cfg.auditPath ?? "off"}`);

  if (!cfg.pages.length) {
    say("");
    say("No Page connected. Run: facebook-mcp login <user access token>");
    process.exitCode = 1;
    return;
  }

  for (const p of cfg.pages) {
    const url = new URL(`${GRAPH_BASE}/${p.id}`);
    url.searchParams.set("fields", "id,name,fan_count");
    url.searchParams.set("access_token", p.accessToken);

    try {
      const res = await fetch(url);
      const body: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        say(`  ${p.name || p.id}: FAILED, ${body?.error?.message ?? res.status}`);
        process.exitCode = 1;
      } else {
        say(`  ${body.name}: ok, ${body.fan_count ?? "?"} followers`);
      }
    } catch (e) {
      say(`  ${p.name || p.id}: unreachable, ${e instanceof Error ? e.message : e}`);
      process.exitCode = 1;
    }
  }
}
