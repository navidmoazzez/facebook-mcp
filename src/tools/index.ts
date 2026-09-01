import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config.js";
import type { Graph } from "../api/client.js";
import type { Guard } from "../safety.js";
import { registerPageTools } from "./pages.js";
import { registerPostTools } from "./posts.js";
import { registerCommentTools } from "./comments.js";
import { registerInsightTools } from "./insights.js";

export function registerAll(server: McpServer, cfg: Config, graph: Graph, guard: Guard) {
  registerPageTools(server, cfg, graph, guard);
  registerPostTools(server, cfg, graph, guard);
  registerCommentTools(server, cfg, graph, guard);
  registerInsightTools(server, cfg, graph);
}
