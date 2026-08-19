# Security Policy

## Never blindly trust an extension

Chrome extensions execute with privileges ordinary web pages do not have. Never install an extension solely because it is popular, open source, available in an official store, recommended by someone you trust, or described as privacy-friendly.

Review the exact code and exact package you intend to install. Ask an independent security professional or a trusted LLM to review the complete repository, then verify the conclusions yourself. AI assistance can reveal risks, but it cannot certify safety.

## Security goals

Gemini Chat Exporter is designed to:

- Act only after an explicit popup button click.
- Access only the active tab temporarily.
- Accept only `https://gemini.google.com/app/<conversation-id>` pages.
- Read rendered prompts and final answers from the current conversation.
- Sanitize exported HTML using a narrow element allowlist.
- Save the result locally through Chrome's downloads API.
- Avoid network requests, telemetry, advertising, remote code, cookies, account APIs, persistent browser storage, and background execution.

These are design goals, not a warranty. Confirm them against the current source before installation.

## Threat model

### Data requiring protection

- Gemini prompts and responses.
- Conversation titles, URLs, and identifiers.
- Personal, professional, confidential, or regulated information present in chats.
- The downloaded JSON files created by the user.

### Trust boundaries

- The source repository and its maintainers.
- The exact extension package installed in Chrome.
- Chrome and the local operating system.
- Google's Gemini page structure and content.
- Development dependencies used only for tests.
- Any person, service, or LLM asked to review the source.

### Risks considered

- A malicious or compromised update adds data exfiltration.
- Store source differs from public repository source.
- Permissions expand beyond the extension's single purpose.
- Remote code, dynamic execution, or tracking is introduced.
- Gemini page markup tricks the exporter into retaining unsafe HTML.
- Sensitive fixture or export files are accidentally published.
- A dependency or build process modifies runtime artifacts.
- Users expose private source or conversations to an online review service.

### Risks outside the extension's control

- Chrome, operating-system, or device compromise.
- Other installed extensions reading the Gemini page or downloaded file.
- Cloud backup, synchronization, antivirus, or indexing software copying exports.
- Users sharing exported JSON with third parties.
- Gemini changing its page structure or rendering misleading content.

## Security-relevant invariants

A reviewer should expect all of the following to remain true:

1. The manifest uses Manifest V3.
2. Required permissions are limited to `activeTab`, `scripting`, and `downloads`.
3. There are no `host_permissions`, optional broad permissions, externally connectable origins, or update URL overrides.
4. There is no service worker or automatically injected content script.
5. Runtime code performs no `fetch`, `XMLHttpRequest`, `WebSocket`, beacon, analytics, or remote logging.
6. Runtime code does not use `eval`, `Function`, string-based script execution, or remotely hosted JavaScript.
7. Runtime code does not access cookies, history, bookmarks, clipboard, identity, local storage, sync storage, or native applications.
8. Extraction starts only after a user clicks the popup button.
9. The page hostname and conversation URL shape are validated before extraction.
10. Downloaded HTML is reconstructed from an allowlist rather than copied verbatim.

If any invariant changes, treat the update as a new product and perform a complete review.

## Source installation security

Installing from source avoids automatic substitution of an opaque package, but it is safe only when you:

1. Review all files in the source snapshot.
2. Confirm that the runtime file list matches the manifest.
3. Run the checks in [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md).
4. Load that exact directory through `chrome://extensions`.
5. Re-review changes before updating the directory.

Do not run `npm install` merely to use the extension. Chrome runtime code has no package dependencies. npm and `jsdom` are needed only for development tests.

## Reporting a vulnerability

Do not publish sensitive reports containing conversations, exported files, credentials, account identifiers, or exploit details that would put users at immediate risk.

When reporting, include:

- The affected version or commit.
- The relevant file and behavior.
- Reproduction steps using synthetic data.
- The security impact.
- A suggested mitigation, if known.

Until a private reporting address is published by the maintainer, open a minimal repository issue asking for a private contact channel. Do not include the vulnerability details in that initial public issue.

## No security guarantee

This project is provided without a guarantee of security or fitness for a particular environment. Automated tests cover known behavior, not every attack. Independent review and least-privilege installation reduce risk; they do not eliminate it.
