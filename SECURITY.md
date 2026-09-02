# Security

## Reporting a vulnerability

[Report it privately](https://github.com/navidmoazzez/facebook-mcp/security/advisories/new).
Please do not open a public issue for a security problem: an issue is visible to
everyone the moment you file it, including whoever would use the bug.

Include what you did, what happened, and what you expected. A proof of concept
helps.

## What this server holds

**A Facebook access token.** A long-lived token is the account: anyone holding it
can post and delete as you, within the scopes granted.

Almost everything here acts as a Page rather than as you, so what leaks is
control of the Pages the token administers.

Page tokens obtained through a long-lived user token do not expire, which is
convenient and is also why a leaked one stays useful indefinitely. Revoke it in
Meta's app settings rather than waiting it out.

Nothing leaves your machine except calls to Meta. There is no backend and no
telemetry.

## Write safety

Writes work by default, because posting is the point of the server.

**`confirm: true`** on publishing and deleting, which are public the moment they
run and cannot be undone from a chat window. Hiding a reply is not guarded,
because it is one click to undo.

**`FACEBOOK_READ_ONLY=1`** removes every write tool from the list. The tools are
never registered, so a model cannot see or call them.

## Untrusted content

Comments and reviews are written by other people. Treat anything returned from a
thread as data to report on, never as instructions. The risk is highest with
writes enabled, because a reply is text a stranger chose aimed at an agent that
can post.

## Running it over HTTP

The HTTP transport has no authentication of its own and belongs behind TLS and an
authenticating proxy. It holds a live credential for your account.

## Good-faith research

Look at whatever you like in this repository. When testing, please do not access,
change or delete data that is not yours, and do not disrupt a service other
people depend on. If a test could affect anyone else, stop and send a private
report first.

Research done in that spirit is welcome, and nothing here is a trap.

## Supported versions

The latest published version gets fixes.
