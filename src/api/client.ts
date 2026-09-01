/**
 * The Graph API client.
 *
 * One place that knows how to talk to Meta, so every tool gets the same
 * timeout, the same retry rules and the same error translation rather than
 * each reimplementing them slightly differently.
 */

import { GRAPH_BASE, type Config, type Page } from "../config.js";
import { explain, isRetryable, GraphError } from "./errors.js";

export type Query = Record<string, string | number | boolean | undefined>;

export class Graph {
  constructor(private cfg: Config) {}

  private async request(
    page: Page,
    method: "GET" | "POST" | "DELETE",
    path: string,
    opts: { query?: Query; body?: Record<string, unknown> } = {},
  ): Promise<any> {
    const url = new URL(`${GRAPH_BASE}/${path.replace(/^\/+/, "")}`);
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
    // The token travels as a query parameter because that is what Graph
    // expects. It is never logged: see audit() in safety.ts, which records the
    // action and never the URL.
    url.searchParams.set("access_token", page.accessToken);

    const attempt = async (): Promise<any> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.cfg.requestTimeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers: {
            "User-Agent": this.cfg.userAgent,
            ...(opts.body ? { "Content-Type": "application/json" } : {}),
          },
          body: opts.body ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });

        const text = await res.text();
        let parsed: any;
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          parsed = { raw: text };
        }

        if (!res.ok) throw explain(res.status, parsed?.error, text);
        return parsed;
      } finally {
        clearTimeout(timer);
      }
    };

    // One retry, and only for rate limits and server faults. Retrying a
    // rejected write would risk posting twice.
    try {
      return await attempt();
    } catch (e) {
      if (method === "GET" && isRetryable(e)) {
        await new Promise((r) => setTimeout(r, 2000));
        return attempt();
      }
      throw e;
    }
  }

  get(page: Page, path: string, query?: Query) {
    return this.request(page, "GET", path, { query });
  }

  post(page: Page, path: string, query?: Query) {
    return this.request(page, "POST", path, { query });
  }

  delete(page: Page, path: string) {
    return this.request(page, "DELETE", path);
  }

  /**
   * Follow paging until the caller has enough.
   *
   * Graph returns a cursor rather than a total, so asking for 500 posts means
   * several round trips. Bounded so a wide query cannot walk a Page's entire
   * history by accident.
   */
  async paged(page: Page, path: string, query: Query, limit: number): Promise<any[]> {
    const out: any[] = [];
    let next: string | undefined;

    for (let i = 0; i < 10 && out.length < limit; i++) {
      const res: any = next
        ? await this.request(page, "GET", "", { query: { __url: next } as Query })
        : await this.get(page, path, { ...query, limit: Math.min(limit - out.length, 100) });

      out.push(...(res?.data ?? []));
      next = res?.paging?.next;
      if (!next) break;
    }
    return out.slice(0, limit);
  }
}

export { GraphError };
