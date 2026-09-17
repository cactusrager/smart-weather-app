# Security Policy

Smart Weather is a static, client-side-only app with no backend, no
database, no user accounts, and no API keys or secrets anywhere in the
codebase. Its attack surface is intentionally small, but we still take
reports seriously.

## Reporting a vulnerability

If you find a security issue (e.g. a way to inject content into the page, an
XSS vector, a way to leak `localStorage` data cross-origin, or a
dependency/CDN integrity issue):

- **Do not** open a public issue describing the exploit.
- Instead, report it privately — via the repository host's private
  vulnerability reporting feature if available, or by contacting a
  maintainer directly.
- Please include: steps to reproduce, affected browser(s)/version(s), and
  the potential impact.

We'll acknowledge reports as quickly as we can and aim to ship a fix before
any public disclosure.

## Scope

In scope:

- The application code in this repository (`index.html`, `css/`, `js/`).
- Misuse of the third-party CDN assets it loads (Bootstrap, Bootstrap
  Icons) or the third-party APIs it calls (Open-Meteo, BigDataCloud).

Out of scope:

- Vulnerabilities in Bootstrap, Bootstrap Icons, Open-Meteo, or
  BigDataCloud themselves — please report those to their respective
  maintainers.
- Denial-of-service against third-party free APIs this app depends on.

## Supported versions

This is a single-branch static site with no versioned releases; only the
latest state of the default branch is supported.
