# Facebook MCP Versions

| Component | Version | Last Updated |
|-----------|---------|--------------|
| facebook-mcp | 0.1.0 | 2026-09-01 |

---

## 0.1.0

First release.

Fifteen tools over Meta's official Graph API: list and inspect Pages, publish
text and photo posts, schedule and draft, list scheduled posts, publish a
draft, edit and delete posts, read and reply to comments, hide and delete them,
and read both Page and post insights.

Read-only by default. Writing needs one environment variable, deleting needs a
second, and every write can be appended to an audit log no tool can edit.

Multi-Page from the start, with a preference order so an unnamed action lands
somewhere predictable rather than wherever happened to be stored first.

`login` exchanges a short-lived user token for Page tokens, and for permanent
ones when app credentials are present. `doctor` checks each link in the chain
and reports the first that is broken, because Meta's own errors rarely say
which one it is.
