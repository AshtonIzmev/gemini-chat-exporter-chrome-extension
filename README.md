# Gemini Chat Exporter

A local Chrome extension that downloads the currently open Google Gemini conversation as a JSON file. It reads the rendered page only: it does not call private Gemini APIs, transmit data, or access other chats.

> [!CAUTION]
>
> # NEVER TRUST CHROME EXTENSIONS BLINDLY
>
> A Chrome extension can read or change sensitive information in every page covered by its permissions. A friendly store listing, many positive reviews, open-source branding, or a successful automated scan is **not proof that an extension is safe**.
>
> **Do not trust this extension merely because this README says it is safe.** Download the repository source, inspect it, and give the complete code to a security professional or your own trusted LLM for an independent security review. Ask it to explain every permission, every network-capable API, every script entry point, and every place user data could leave the browser. Treat an AI review as useful assistance, not a guarantee.
>
> For the strongest practical control, install an audited snapshot yourself with Chrome's **Load unpacked** feature. Re-review every update before installing it. If the source, permissions, packaged files, or behavior do not match what you reviewed, do not install it.
>
> **Want the simplest review path?** Attach this complete repository to your trusted LLM and paste [LLM_SECURITY_REVIEW_PROMPT.md](LLM_SECURITY_REVIEW_PROMPT.md). Do not install if it cannot inspect every runtime file or reports unresolved critical/high-risk findings.
>
> See [SECURITY.md](SECURITY.md) for the threat model and [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) for the full manual review checklist.

## Three-step safety review

1. **Download the source:** Use a specific repository snapshot and do not include any private conversations or exports.
2. **Ask your trusted LLM:** Attach the complete source and paste the ready-made [security review prompt](LLM_SECURITY_REVIEW_PROMPT.md).
3. **Act on the verdict:** Only continue if every runtime file was reviewed, every permission is justified, no unexplained data transmission exists, and you accept the stated residual risks. Then install that same reviewed snapshot with **Load unpacked**.

This process is intentionally simple, but it is not a security guarantee. LLMs can miss vulnerabilities, source downloads can be tampered with, and later updates can change behavior. Repeat it for every version.

## Why this warning exists

Extensions run inside one of the most sensitive applications on your computer. Depending on their permissions, they may be able to inspect private conversations, email, documents, account pages, browsing activity, and data entered into websites. An extension can also be safe today and become unsafe later through a compromised maintainer account, malicious dependency, ownership transfer, or harmful update.

Open source helps only when someone reviews the exact source being installed. It does not automatically prove that a store package was built from that source, that every dependency is trustworthy, or that future updates remain safe.

This project intentionally encourages source installation and independent review. That is how it was created: the desired behavior was defined, the generated implementation was reviewed, the permissions were minimized, and the result was tested locally. You should repeat that process for yourself rather than inheriting the maintainer's trust assumptions.

## Recommended trust process

1. Obtain the source from a location you intentionally chose.
2. Record the commit or archive hash you reviewed.
3. Read [manifest.json](manifest.json) first and reject unexplained permissions.
4. Review all runtime files under [src](src) and [popup](popup).
5. Search for network requests, dynamic code execution, remote code, tracking, storage, cookie access, and broad host permissions.
6. Ask a trusted security reviewer or LLM to audit the complete source. Do not provide private conversations, credentials, tokens, or other secrets to an online model.
7. Run the tests and inspect the packaged file list.
8. Install that reviewed snapshot from source.
9. Disable automatic trust: review changes before every update.
10. Remove the extension when you no longer need it.

No checklist eliminates all risk. The purpose is to make trust explicit, evidence-based, and revocable.

## Install

### Recommended: install reviewed source

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Pin **Gemini Chat Exporter** from Chrome's Extensions menu.

Before loading it, complete the review in [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md). Chrome may warn that developer-mode extensions can be unsafe. That warning is valid: installing from source gives you control over the files, but it does not make unreviewed source safe.

### Chrome Web Store installation

A store installation is easier and benefits from Google's review process, but store review is not a substitute for your own judgment. Store packages can update automatically, and users generally do not inspect each update. Compare the published version and permissions with this repository, read the privacy disclosures, and uninstall the extension if permissions or behavior change unexpectedly.

## Use

1. Open a conversation at `https://gemini.google.com/app/<conversation-id>` and wait for it to load.
2. Click the extension icon.
3. Click **Download current chat**.

Chrome saves a pretty-printed JSON file in the default Downloads folder. Existing filenames are preserved by adding a number to the new export.

The exported JSON contains the conversation content visible in the current page. Treat that file as sensitive. It may include personal communications, confidential work, source code, health information, financial details, or identifying information. Store, transmit, and delete exports according to the sensitivity of the underlying conversation.

## What the extension does

1. The popup waits for an explicit click on **Download current chat**.
2. `activeTab` grants temporary access to the tab the user invoked.
3. `chrome.scripting.executeScript` runs the local extractor in the main frame.
4. The extractor validates the Gemini URL and reads rendered conversation elements.
5. It creates plain text and sanitized semantic HTML for each visible prompt and final answer.
6. The popup serializes the result and asks Chrome to download it as JSON.

It does not monitor browsing in the background, access Gemini cookies, call undocumented Gemini endpoints, upload exports, or keep a copy of the conversation.

## JSON format

```json
{
  "schemaVersion": 1,
  "source": "Google Gemini",
  "title": "Example conversation",
  "url": "https://gemini.google.com/app/example-id",
  "conversationId": "example-id",
  "exportedAt": "2026-08-19T12:00:00.000Z",
  "messages": [
    {
      "index": 0,
      "role": "user",
      "text": "Hello",
      "html": "Hello"
    },
    {
      "index": 1,
      "role": "assistant",
      "text": "Hello. How can I help?",
      "html": "<p>Hello. How can I help?</p>"
    }
  ]
}
```

The sanitized `html` retains common headings, paragraphs, emphasis, lists, links, code, and tables. Scripts, styles, controls, event handlers, framework attributes, and unsupported URL schemes are removed.

## Permissions

- `activeTab`: temporarily reads the current tab after you click the extension.
- `scripting`: runs the extractor in the current Gemini tab.
- `downloads`: saves the generated JSON file locally.

The extension has no persistent host access, background service, analytics, or remote server.

### Permission boundaries

| Permission  | Why it is needed                                   | What limits it                                                              |
| ----------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `activeTab` | Read the current Gemini page after user invocation | Temporary access to the active tab; no persistent all-sites host permission |
| `scripting` | Execute the local extractor in that tab            | Called only from the popup after the export button is clicked               |
| `downloads` | Save the generated JSON file                       | Used only to create the requested local export                              |

Any future request for cookies, history, web requests, persistent host access, native messaging, clipboard access, or broad site access should be treated as a security-significant change requiring a fresh review.

## Privacy

Conversation content is processed locally in the browser and written to a file selected by Chrome's download system. The extension does not transmit, sell, share, retain, analyze, or monetize that content. It contains no telemetry or advertising.

Local processing still means the extension handles sensitive user data. Read [PRIVACY.md](PRIVACY.md) for the full data-flow statement. Browser behavior, operating-system backups, sync tools, endpoint security products, and whatever you do with the downloaded file are outside this extension's control.

## Architecture

```text
User click
  |
  v
Popup controller ---- chrome.scripting ----> Gemini tab DOM
  |                                           |
  |                                      Extract + sanitize
  |                                           |
  <-------------- serializable JSON object --+
  |
  v
chrome.downloads -> local JSON file
```

Runtime code is deliberately small:

- [manifest.json](manifest.json) declares the extension and its permissions.
- [popup/popup.js](popup/popup.js) validates the active tab, invokes extraction, and starts the download.
- [src/extractor.js](src/extractor.js) reads and sanitizes the rendered Gemini conversation.
- [popup/popup.html](popup/popup.html) and [popup/popup.css](popup/popup.css) provide the local user interface.

There is no service worker, content script that runs automatically, server component, runtime dependency, or remotely hosted code.

## Development

```sh
npm install
npm test
```

The automated tests cover message order, metadata, rich HTML sanitization, unsafe markup, unsupported pages, and empty conversations. The current selectors were also checked against [examples/example1.html](examples/example1.html), which exports 9 user prompts and 9 Gemini responses.

### Review-friendly package contents

A distributable package should contain only the runtime files:

```text
manifest.json
icons/*.png
popup/popup.html
popup/popup.css
popup/popup.js
src/extractor.js
```

Do not publish `node_modules/`, tests, development settings, local exports, or saved conversation fixtures. Review the archive file list before installing or publishing it.

### Updates

Every Chrome Web Store update must increment the manifest version. Security-conscious source users should compare the new source against their reviewed version, repeat the security checklist, rerun tests, and only then replace the unpacked extension. A version number by itself says nothing about safety.

## Independent review

Security reports are welcome. Do not include real Gemini conversations, exported JSON, credentials, or private account details in a public issue. Follow the reporting guidance in [SECURITY.md](SECURITY.md).

An LLM can accelerate review by tracing data flow and identifying suspicious APIs, but it can miss vulnerabilities or confidently produce an incorrect conclusion. Use a model you trust, understand its data-retention policy, remove secrets, provide all relevant files, and verify its findings manually. Start with the copy-paste [LLM security review prompt](LLM_SECURITY_REVIEW_PROMPT.md); advanced reviewers can continue with [the complete manual checklist](docs/SECURITY_REVIEW.md).

## Limitations

- Gemini can change its page structure; selectors may need updating after a site redesign.
- Version 1 exports the currently rendered final prompts and answers only.
- Sources, attachments, generated media, thinking/tool traces, alternate drafts, and message timestamps are not exported.
- Very large chats may take a moment to serialize and download.
- DOM sanitization reduces exported-HTML risk but cannot prove that every future Gemini markup pattern is harmless.
- Neither tests, open source, Chrome Web Store review, nor an LLM audit can guarantee that an extension is secure.

## Project status and affiliation

This is an independent utility and is not affiliated with, sponsored by, or endorsed by Google. Gemini and Chrome are trademarks of Google LLC.

Use the extension at your own risk. You are responsible for reviewing the software, protecting exported conversations, and deciding whether its permissions are acceptable for your environment.
