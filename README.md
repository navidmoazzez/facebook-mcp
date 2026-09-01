<div align="center">
  <img src="https://cdn.navid.media/connectors/facebook-icon.png" alt="Facebook" width="88">
</div>

# Facebook MCP

[![npm](https://img.shields.io/npm/v/@thenavidm/facebook-mcp?color=orange&label=npm)](https://www.npmjs.com/package/@thenavidm/facebook-mcp)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)
[![YouTube](https://img.shields.io/badge/YouTube-@thenavidm-red?logo=youtube&logoColor=white)](https://youtube.com/@thenavidm?sub_confirmation=1)
[![X](https://img.shields.io/badge/X-@thenavidm-black?logo=x)](https://x.com/thenavidm)

Give any AI agent real access to your Facebook Pages. Post, schedule, draft, read your numbers, and moderate comments, from Claude Code, Claude Desktop, Claude.ai, Cursor, Codex, or any MCP client.

Built on Meta's official Graph API, so nothing here is reverse engineered and nothing is going to break when Facebook ships an update.

Built by [Navid Moazzez](https://navid.me).

```
You: how did last week's posts do, and schedule the follow-up for Tuesday 9am

Claude: Reading your Page insights.

  3 posts, 14,200 impressions, 380 engagements
  The Thursday one did 4x the others

  Scheduled the follow-up for Tuesday 09:00.
```

## Contents

| | Section | |
|---|---|---|
| 1 | [What you can ask it](#1-what-you-can-ask-it) | Real prompts, not features |
| 2 | [Install](#2-install) | Every client, copy and paste |
| 3 | [Connecting your Page](#3-connecting-your-page) | Getting a token that lasts |
| 4 | [Tools](#4-tools) | All fifteen, with arguments |
| 5 | [Posting safely](#5-posting-safely) | Why it cannot post by default |
| 6 | [Several Pages](#6-several-pages) | Picking which one acts |
| 7 | [Limits worth knowing](#7-limits-worth-knowing) | What Facebook will not let you do |
| 8 | [Troubleshooting](#8-troubleshooting) | When something breaks |
| 9 | [FAQ](#faq-) | Common questions |

---

## 1. What you can ask it

- Schedule this post for Tuesday at 9am.
- How did last week's posts do compared to the week before?
- Draft three versions of an announcement and save them, I will pick one.
- Which post this month got the most engagement, and why do you think that is?
- Read the comments on the latest post and tell me if anything needs a reply.
- Hide the spam comments on that post.
- What is my follower growth over the last month?

The point is the loop. You can ask what worked, then act on the answer, without leaving the conversation.

---

## 2. Install

```bash
npx -y @thenavidm/facebook-mcp --version
```

Node 20 or newer. Nothing else.

Then add it to your client.

#### Claude Code

```bash
claude mcp add --transport stdio facebook -- npx -y @thenavidm/facebook-mcp
```

To allow posting as well as reading:

```bash
claude mcp add --transport stdio --env FACEBOOK_ALLOW_WRITE=true facebook -- npx -y @thenavidm/facebook-mcp
```

#### Claude Desktop

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "facebook": {
      "command": "npx",
      "args": ["-y", "@thenavidm/facebook-mcp"],
      "env": { "FACEBOOK_ALLOW_WRITE": "true" }
    }
  }
}
```

Quit Claude Desktop completely and reopen it.

#### Cursor

`~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` inside one.

```json
{
  "mcpServers": {
    "facebook": {
      "command": "npx",
      "args": ["-y", "@thenavidm/facebook-mcp"]
    }
  }
}
```

#### VS Code with GitHub Copilot

`.vscode/mcp.json`. Note it uses `servers`, not `mcpServers`.

```json
{
  "servers": {
    "facebook": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@thenavidm/facebook-mcp"]
    }
  }
}
```

#### Windsurf

`~/.codeium/windsurf/mcp_config.json`, same shape as Cursor.

#### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.facebook]
command = "npx"
args = ["-y", "@thenavidm/facebook-mcp"]
```

#### Any other MCP client

| Field | Value |
|---|---|
| Transport | stdio |
| Command | `npx` |
| Arguments | `-y @thenavidm/facebook-mcp` |

---

## 3. Connecting your Page

Facebook tokens are the fiddly part, so this is the whole thing in order.

**Get a user token.** Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/). Pick your app, or create one. Add these permissions:

```
pages_show_list
pages_manage_posts
pages_read_engagement
pages_manage_engagement
read_insights
```

Click Generate Access Token and copy it.

**Exchange it for Page tokens.**

```bash
npx @thenavidm/facebook-mcp login <that token>
```

That writes `~/.facebook-mcp/pages.json`, mode 600, holding one token per Page you administer.

**Make them permanent.** The token from the Explorer expires in about an hour, and Page tokens derived from it inherit that. To get ones that never expire, set your app credentials first:

```bash
export FACEBOOK_APP_ID=...
export FACEBOOK_APP_SECRET=...
npx @thenavidm/facebook-mcp login <that token>
```

Both are on your app's Settings, Basic page. With them, login exchanges for a long-lived token first, and the resulting Page tokens do not expire at all.

**Check it worked.**

```bash
npx @thenavidm/facebook-mcp doctor
```

It names every Page it can reach, or says exactly which link in the chain is broken.

---

## 4. Tools

Fifteen. Each declares whether it reads or writes, so your client can show you before anything runs.

| Tool | | What it does |
|---|---|---|
| `list_pages` | read | Every Page this server can act as |
| `get_page` | read | Name, category, followers, about, website |
| `list_posts` | read | Published posts with reaction, comment and share counts |
| `list_scheduled_posts` | read | Scheduled and draft posts not yet out |
| `get_page_insights` | read | Impressions, reach, engagement, follower change |
| `get_post_insights` | read | How one post did |
| `list_comments` | read | Comments with author and time |
| `create_post` | **write** | Text post, optionally with a link |
| `create_photo_post` | **write** | Photo from a URL, with a caption |
| `publish_draft` | **write** | Push a draft or scheduled post out now |
| `update_post` | **write** | Edit the text of a published post |
| `reply_to_comment` | **write** | Public reply, as the Page |
| `hide_comment` | **write** | Hide or unhide. Reversible |
| `delete_post` | **delete** | Cannot be undone |
| `delete_comment` | **delete** | Cannot be undone |

### Scheduling and drafts

`create_post` covers all three cases:

| | |
|---|---|
| Post now | just `message` |
| Save a draft | `draft: true` |
| Schedule | `publish_at`, an ISO timestamp |

Facebook requires a scheduled time at least 10 minutes out and at most 6 months ahead. Its own error for breaking that says nothing useful, so this checks first and tells you which rule you hit.

---

## 5. Posting safely

A Page post is public the moment it lands, in front of everyone who follows you. Deleting one is worse, because it cannot be undone.

Those are two different levels of risk, so they are two different switches.

**Reading needs nothing.** Insights, posts and comments work out of the box.

**Writing needs `FACEBOOK_ALLOW_WRITE=true`.** Posting, editing, replying and hiding all refuse without it. A default install cannot publish anything.

**Deleting needs `FACEBOOK_ALLOW_DELETE=true` as well.** Deliberately separate, because deleting a post is the one action here with no undo.

**Every write can be logged.** Set `FACEBOOK_AUDIT_LOG=/path/to/file` and every attempt is appended, with no tool able to read or edit it.

Comment text is also labelled as data rather than instructions when handed to the model. Comments are written by strangers, and an agent that reads them and can also post is exposed to whatever they put there.

---

## 6. Several Pages

If you administer more than one, `list_pages` shows them and every tool takes a `page` argument to name one.

When you do not name one, it uses the first, which is rarely what you want. Set an order instead:

```bash
export FACEBOOK_PREFERRED_PAGES="Navid Media,Side Project"
```

Exact name matches beat prefix matches, so a Page called "Navid Media" will not swallow a request meant for "Navid".

---

## 7. Limits worth knowing

**Pages only.** Facebook removed the ability to post to a personal profile in 2018 and never replaced it. No API can do it, including this one.

**Insights lag.** Numbers can take a few hours to settle, so today's post will look quieter than it is.

**Rate limits are per app, not per Page.** Heavy use across several Pages shares one budget. The client backs off and retries reads, but never retries a write, because retrying a post risks publishing twice.

**Edits are visible.** Facebook shows viewers an edit history on any post you change.

---

## 8. Troubleshooting

**"The Page token is invalid or expired."** The token was short-lived. Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` and run `login` again for permanent ones.

**"The token is missing a permission."** Regenerate in the Graph API Explorer with all five permissions listed above. Missing `pages_read_engagement` is the usual one, and it breaks reading rather than writing, which makes it confusing.

**"That token can see no Pages."** It is missing `pages_show_list`, or you are not an admin of any Page.

**Posting refuses.** That is the default. Set `FACEBOOK_ALLOW_WRITE=true`.

**Nothing works and the error is vague.** Run `doctor`. It checks each Page and reports the first broken link.

---

## FAQ ❓

<details>
<summary><strong>Can it post to my personal profile?</strong></summary>

No, and neither can anything else. Facebook removed profile posting from the API in 2018 after Cambridge Analytica and never brought it back. Pages are the only writable surface.
</details>

<details>
<summary><strong>Is this using an unofficial API?</strong></summary>

No. It is Meta's official Graph API, the same one their own tools use. Nothing is reverse engineered, nothing violates their terms, and your account is not at risk.
</details>

<details>
<summary><strong>Do the tokens expire?</strong></summary>

Page tokens derived from a long-lived user token do not expire at all. That is why `login` exchanges for one when you give it your app id and secret.

Without them you get short-lived tokens that die in about an hour, which is the single most common reason this stops working.
</details>

<details>
<summary><strong>Can it schedule posts?</strong></summary>

Yes, natively. Facebook is one of the few platforms whose API supports real scheduling and real drafts, so nothing here is queued locally waiting for your machine to be awake. You hand it to Facebook and it goes out whether or not anything of yours is running.
</details>

<details>
<summary><strong>Will it post something without me knowing?</strong></summary>

It cannot post at all unless you set `FACEBOOK_ALLOW_WRITE=true`. With that on, it can, so set `FACEBOOK_AUDIT_LOG` and every attempt is written to a file no tool can edit.
</details>

<details>
<summary><strong>What about Instagram?</strong></summary>

Different server. Instagram's official API is business accounts only and quite limited, so reaching a personal account means an unofficial library. That is a separate project with a different risk profile.
</details>

<details>
<summary><strong>Does it work with several Pages?</strong></summary>

Yes. `login` stores every Page you administer, and each tool takes a `page` argument. Set `FACEBOOK_PREFERRED_PAGES` so an unnamed action lands somewhere predictable.
</details>

<details>
<summary><strong>Can it read comments and reply?</strong></summary>

Yes, both. It can also hide comments, which is reversible and the right answer for spam. Deleting is possible but needs a separate switch, since it cannot be undone.
</details>

---

## About the author

Navid Moazzez is a leading AI business strategist, and the host of the AI Creator Summit, watched by 100,000+ creators. He helps creators and founders master AI and build their own AI Operating System (AI OS) to automate their business and life. This Facebook MCP server is one piece of that system.

**Links**

- Personal website: [navid.me](https://navid.me)
- YouTube: [@thenavidm](https://youtube.com/@thenavidm?sub_confirmation=1) and [@thenavidai](https://youtube.com/@thenavidai?sub_confirmation=1)
- X: [@thenavidm](https://x.com/thenavidm)
- Instagram: [@thenavidm](https://instagram.com/thenavidm)
- LinkedIn: [thenavidm](https://linkedin.com/in/thenavidm)

## License

[MIT](./LICENSE). Free to use, modify, and share.

---

© 2026 NM Media. Made with ❤️ by [Navid Moazzez](https://navid.me).
