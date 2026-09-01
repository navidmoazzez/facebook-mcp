# Security

This server can post publicly as your Facebook Page. This page says what
protects you, and what does not.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting: open the
[Security tab](https://github.com/thenavidm/facebook-mcp/security/advisories/new)
and click **Report a vulnerability**. That keeps it private until a fix exists.

Please do not open a public issue for a security problem.

## What it can reach

Only Pages you administer, and only through Meta's official Graph API. It
cannot touch a personal profile, because Facebook removed that from the API in
2018.

## Three levels, three switches

**Reading** needs nothing. Insights, posts and comments work out of the box.

**Writing** needs `FACEBOOK_ALLOW_WRITE=true`. Posting, editing, replying and
hiding all refuse without it, so a default install cannot publish.

**Deleting** needs `FACEBOOK_ALLOW_DELETE=true` on top. Separate because it is
the only action here with no undo.

## The injection risk

Comments are written by strangers. An agent that reads them and can also post
is exposed: somebody puts instructions in a comment, your agent reads them
while triaging, and acts on them.

What is done about it: comment text is labelled as data rather than
instructions when handed to the model, writes are off by default, and deletes
need a second switch. What is not done: nothing removes the risk entirely.

Set `FACEBOOK_AUDIT_LOG=/path/to/file` and every attempted write is appended,
with no tool able to read or edit it.

## Your tokens

`~/.facebook-mcp/pages.json`, written mode 600 in a mode 700 directory.

Page tokens derived from a long-lived user token **do not expire**. Anyone who
reads that file can post as your Page indefinitely. Treat it as a password.

Tokens travel as a query parameter, because Graph requires it. They are never
written to the audit log, which records the action and never the URL.

## What this cannot protect you from

**A compromised machine is a compromised Page.** The tokens are on disk because
they have to be.

**Anything a tool returns enters your conversation** with the model, and goes
wherever that model runs. True of every MCP server.

**Not affiliated with Meta or Facebook.**
