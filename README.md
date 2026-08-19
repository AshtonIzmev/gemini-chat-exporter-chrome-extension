# Gemini Chat Exporter

A local Chrome extension that downloads the currently open Google Gemini conversation as a JSON file. It reads the rendered page only: it does not call private Gemini APIs, transmit data, or access other chats.

## Install

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Pin **Gemini Chat Exporter** from Chrome's Extensions menu.

## Use

1. Open a conversation at `https://gemini.google.com/app/<conversation-id>` and wait for it to load.
2. Click the extension icon.
3. Click **Download current chat**.

Chrome saves a pretty-printed JSON file in the default Downloads folder. Existing filenames are preserved by adding a number to the new export.

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

## Development

```sh
npm install
npm test
```

The automated tests cover message order, metadata, rich HTML sanitization, unsafe markup, unsupported pages, and empty conversations. The current selectors were also checked against [examples/example1.html](examples/example1.html), which exports 9 user prompts and 9 Gemini responses.

## Limitations

- Gemini can change its page structure; selectors may need updating after a site redesign.
- Version 1 exports the currently rendered final prompts and answers only.
- Sources, attachments, generated media, thinking/tool traces, alternate drafts, and message timestamps are not exported.
- Very large chats may take a moment to serialize and download.
