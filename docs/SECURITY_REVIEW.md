# Independent Security Review Guide

This guide helps users review Gemini Chat Exporter before installing it. It is also a general model for evaluating small Chrome extensions.

> [!WARNING]
> Completing this checklist does not prove an extension is safe. It provides structured evidence for a decision. Review the exact version you will install and repeat the process after every update.

## 1. Establish what you are reviewing

Record the repository URL, commit identifier, acquisition date, and archive hash. This lets you identify the exact source snapshot behind your decision.

```sh
git rev-parse HEAD
git status --short
find . -type f -not -path './.git/*' -not -path './node_modules/*' -print | sort
```

If the working tree contains unexplained modifications, stop and understand them before proceeding.

For a downloaded ZIP, calculate a SHA-256 hash before extracting it:

```sh
shasum -a 256 gemini-chat-exporter.zip
```

## 2. Start with the manifest

Read `manifest.json` completely. The manifest defines the major privilege boundaries and runtime entry points.

Expected permissions:

```json
["activeTab", "downloads", "scripting"]
```

Investigate or reject additions such as:

- `<all_urls>` or broad `host_permissions`.
- `cookies`, `history`, `webRequest`, `debugger`, `identity`, or `management`.
- Native messaging.
- Clipboard permissions.
- Persistent background service workers without a clear need.
- Automatically injected content scripts.
- `externally_connectable` origins.
- An unexplained `update_url` in source distributions.

Confirm every manifest entry points to a file present in the reviewed source.

## 3. Enumerate runtime code

For the current architecture, runtime code should be limited to:

```text
manifest.json
icons/*.png
popup/popup.html
popup/popup.css
popup/popup.js
src/extractor.js
```

Tests, documentation, examples, package metadata, and `node_modules` are not required by Chrome at runtime. A store ZIP should not contain private fixtures or development dependencies.

## 4. Search for dangerous capabilities

Use searches as leads, not proof. Code can express the same behavior in many ways.

```sh
rg -n \
  'fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource|eval|new Function|import\(|chrome\.storage|chrome\.cookies|chrome\.history|chrome\.identity|document\.cookie|localStorage|indexedDB' \
  manifest.json popup src
```

Expected result: no unexplained matches. The extension should not need network communication, dynamic code execution, persistent storage, cookies, identity, or browsing history.

Search for URLs and remote resources:

```sh
rg -n 'https?://|src=|href=' manifest.json popup src
```

Expected result: only intentional Gemini URL validation or static local references. There should be no remote script, tracking pixel, analytics endpoint, webhook, or upload service.

Search for extension API usage:

```sh
rg -n 'chrome\.[A-Za-z]+' manifest.json popup src
```

Expected APIs are limited to querying the active tab, executing the extractor, and initiating the requested download.

## 5. Trace the data flow manually

Verify this complete path:

1. User clicks the popup export button.
2. The popup queries the active tab.
3. The popup rejects non-Gemini conversation URLs.
4. The popup injects `extractGeminiChat` into the selected tab.
5. The extractor validates hostname and pathname again.
6. The extractor reads only rendered conversation containers.
7. Sanitization reconstructs supported HTML elements and drops unsafe content.
8. The result returns to the popup as a serializable object.
9. The popup creates a JSON data URL and calls `chrome.downloads.download`.
10. No other code receives or stores the conversation.

For every value derived from the page, ask:

- Where does it enter the extension?
- Is it validated or sanitized?
- Where is it stored?
- Can it reach a network API?
- Can it become executable code or markup?
- Does it persist after the popup closes?

## 6. Review HTML sanitization

The extractor should create a new document and rebuild markup from a narrow allowlist. Check that it:

- Drops scripts, styles, iframes, forms, controls, SVG, and canvas.
- Drops hidden elements.
- Removes event handlers, inline styles, classes, IDs, and framework attributes by not copying them.
- Allows only `http` and `https` links.
- Preserves text without interpreting it as HTML.
- Keeps only explicitly supported table span attributes.

Pay special attention to future changes involving images, media, CSS, `data:` URLs, SVG, MathML, custom attributes, or direct `innerHTML` copying.

## 7. Review dependencies and build reproducibility

The extension has no runtime npm dependency and no build step. That is a meaningful security advantage: the reviewed JavaScript is the JavaScript Chrome executes.

`jsdom` is a development-only dependency used for tests. You do not need to run `npm install` to install the extension. If you do run development tools:

```sh
npm audit
npm test
```

Review changes to `package-lock.json` before accepting dependency updates. A clean test result verifies expected behavior; it does not establish absence of malicious behavior.

## 8. Inspect the package before installation

Create a runtime-only archive from the repository root:

```sh
rm -f gemini-chat-exporter.zip
zip -r gemini-chat-exporter.zip manifest.json icons popup src \
  -x 'icons/icon.svg' '*.DS_Store'
unzip -l gemini-chat-exporter.zip
```

Never package:

- `node_modules/`
- `.git/` or `.vscode/`
- `tests/`
- `examples/`
- Downloaded conversations or JSON exports
- Credentials, environment files, tokens, or private notes

For source installation, load the reviewed repository directory. For store publication, upload only the reviewed runtime archive.

## 9. Review with a trusted LLM

Choose a model and service whose privacy and retention practices you accept. Source code itself can be confidential. Never include real conversations, exported JSON, API keys, browser profiles, cookies, tokens, or credentials.

Provide every runtime file, the manifest, tests, package metadata, and lockfile. Partial context can hide critical behavior. Ask for evidence and file references rather than a simple safe/unsafe verdict.

For the easiest copy-paste workflow and a structured installation verdict, use [LLM_SECURITY_REVIEW_PROMPT.md](../LLM_SECURITY_REVIEW_PROMPT.md). The shorter prompt below is retained as an advanced-review summary.

Suggested prompt:

```text
Act as a skeptical browser-extension security reviewer. Audit the complete
attached Chrome extension repository. Do not assume README claims are true.

1. Map every manifest permission to the exact code that uses it and determine
   whether a narrower permission could work.
2. Enumerate all runtime entry points, scripts, event handlers, extension APIs,
   network-capable APIs, storage mechanisms, and external resources.
3. Trace all user data from the active page through processing, serialization,
   storage, download, logging, and any possible transmission.
4. Look for remote code, dynamic execution, obfuscation, analytics, tracking,
   credential access, cookie access, broad host access, hidden behavior,
   supply-chain risk, and discrepancies between documentation and code.
5. Analyze DOM extraction and HTML sanitization for injection, unsafe URL,
   DOM-clobbering, prototype-pollution, and data-exfiltration risks.
6. Inspect dependencies, lockfiles, tests, packaging instructions, and update
   behavior. Distinguish runtime dependencies from development dependencies.
7. Identify privacy-policy and Chrome Web Store disclosure requirements based
   on actual behavior.
8. Report findings by severity with exact file references, exploit conditions,
   impact, and concrete remediation. State uncertainties explicitly.
9. Finish with a permission table, data-flow diagram, residual-risk section,
   and a list of manual checks I must perform myself.

Do not provide a blanket assurance. Attempt to falsify the claim that the
extension processes Gemini conversations only locally after an explicit click.
```

Challenge the response. Ask the reviewer to show the code behind each conclusion. Run suspicious searches yourself and compare multiple independent reviews when the data sensitivity justifies it.

## 10. Install with controlled expectations

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select the reviewed directory.
4. Confirm Chrome displays only expected permissions.
5. Test first with a synthetic, non-sensitive conversation.
6. Observe the browser's network panel and Downloads page if desired.
7. Remove the extension after use if continuous installation is unnecessary.

Consider a separate Chrome profile for highly sensitive work. This limits exposure to unrelated extensions and reduces accidental cross-profile access, though it does not defend against a compromised browser or operating system.

## 11. Review every update

Before updating:

```sh
git diff --stat OLD_COMMIT..NEW_COMMIT
git diff OLD_COMMIT..NEW_COMMIT -- manifest.json popup src package.json package-lock.json
```

Re-run the full checklist when permissions, runtime entry points, data flow, dependencies, or packaging change. Small diffs can still be security-critical.

## Decision record

Write down:

- Exact version reviewed.
- Reviewer or model used.
- Files and commands checked.
- Findings and unresolved questions.
- Permissions accepted.
- Date approved for installation.
- Conditions that require re-review.

A written record prevents vague memory from turning a one-time review into permanent trust.
