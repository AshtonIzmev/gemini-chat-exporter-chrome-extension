# Privacy Policy

Last updated: August 19, 2026

## Summary

Gemini Chat Exporter processes the currently displayed Google Gemini conversation locally so the user can download it as a JSON file. The extension does not transmit conversation data to the developer or any third party.

## Data processed

After the user explicitly clicks **Download current chat**, the extension processes:

- The current tab URL.
- The Gemini conversation title and identifier.
- Rendered user prompts and Gemini responses in the current page.
- Links and supported formatting contained in those rendered messages.

This content may contain personal communications, user-generated content, identifying information, confidential information, or other sensitive data chosen by the user.

## Purpose

The data is used only to create the JSON export requested by the user. It is not used for advertising, analytics, profiling, model training, product research, or any unrelated purpose.

## Collection, transmission, and sharing

The extension:

- Does not send conversation content to the developer.
- Does not send conversation content to external servers.
- Does not include telemetry, analytics, advertising, or crash reporting.
- Does not sell or share user data.
- Does not allow the developer or other humans to read user conversations.
- Does not use remotely hosted code.

All extraction and serialization occur locally inside the user's browser.

## Storage and retention

The extension does not maintain its own database or persistent browser storage. It passes the generated JSON to Chrome's downloads system. The downloaded file remains on the user's device until the user moves or deletes it.

Chrome, the operating system, backups, synchronization services, endpoint security tools, file indexers, and other installed software may independently process downloaded files. Those systems are outside this project's control and are governed by their own policies.

## Permissions

- `activeTab` provides temporary access to the current tab after user invocation.
- `scripting` runs the local extraction function in that tab.
- `downloads` saves the user-requested JSON file.

The extension does not request persistent access to Gemini or all websites.

## Security

Runtime code is intentionally small, local, and readable. Exported HTML is reconstructed using a semantic allowlist and unsafe URL schemes are rejected. Nevertheless, no software is guaranteed secure. Users should review the source and follow [SECURITY.md](SECURITY.md).

## User control

Users control processing by choosing when to click the export button. They can remove the extension from `chrome://extensions` and delete any previously downloaded JSON files at any time.

## Changes

Material changes to data handling should be reflected in this policy, the Chrome Web Store disclosures, and the extension's user interface before release. Users installing from source should review every update.

## Contact

Until a dedicated privacy contact is published, use the repository issue tracker for non-sensitive questions. Never post conversation data, exported JSON, credentials, or private identifiers in a public issue.
