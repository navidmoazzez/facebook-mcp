# Facebook MCP Versions

| Component | Version | Last Updated |
|-----------|---------|--------------|
| facebook-mcp | 0.1.0 | 2026-09-01 |

Published as [`@thenavidm/facebook-mcp`](https://www.npmjs.com/package/@thenavidm/facebook-mcp).

---

## 0.1.0

First release. 15 tools over Meta's official Graph API.

**Pages**

`list_pages` and `get_page`. Multi-Page from the start, with a preference order
so an unnamed action lands somewhere predictable rather than on whichever Page
happened to be stored first. Exact name matches beat prefix matches, or a Page
called "Navid Media" would swallow a request meant for "Navid".

**Posting**

`create_post`, `create_photo_post`, `publish_draft`, `update_post`,
`delete_post`, `list_posts` and `list_scheduled_posts`.

Scheduling and drafting are native: Facebook holds the post and publishes it
itself, so nothing has to be running at the time. Scheduled times are checked
against Facebook's 10 minute to 6 month window before sending, because its own
error for breaking that says nothing useful.

**Comments**

`list_comments`, `reply_to_comment`, `hide_comment` and `delete_comment`.
Hiding is reversible and is the tool to reach for; deleting sits behind a
separate switch.

**Insights**

`get_page_insights` and `get_post_insights`. Separate tools because Meta uses
different metric names for each, and pretending otherwise would produce empty
results.

**Safety**

Read-only by default. Writing needs `FACEBOOK_ALLOW_WRITE`, deleting needs
`FACEBOOK_ALLOW_DELETE` on top, and every write can be appended to an audit log
no tool can read or edit.

**Errors**

Meta's messages are written for whoever built the SDK. The common ones are
translated into the action that fixes them, and `doctor` checks each link in
the token chain and reports the first that is broken.

Reads retry once on rate limits and server faults. Writes never retry, because
retrying a post risks publishing twice.

**Tests**

26, covering config resolution, the Page picker, the three permission levels
and error translation.
