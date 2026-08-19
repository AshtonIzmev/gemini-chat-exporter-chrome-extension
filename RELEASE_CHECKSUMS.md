# Release Checksums

Checksums for the locally generated runtime-only extension archive.

## Version 1.0.0

Artifact: `gemini-chat-exporter-v1.0.0.zip`

Size: `14568 bytes`

| Algorithm | Checksum                                                           |
| --------- | ------------------------------------------------------------------ |
| SHA-256   | `57524711f305e35602822d2d892cabfc245f56a66ff0639f109f385cbd7ded4b` |
| MD5       | `6bfcd6c7020c03cacc794de90eac9f54`                                 |

Verify on macOS:

```sh
shasum -a 256 gemini-chat-exporter-v1.0.0.zip
md5 gemini-chat-exporter-v1.0.0.zip
```

Verify on Linux:

```sh
sha256sum gemini-chat-exporter-v1.0.0.zip
md5sum gemini-chat-exporter-v1.0.0.zip
```

The SHA-256 output must match the value above exactly. MD5 is included only for compatibility and accidental-corruption checks; it is not collision resistant and should not be treated as a security guarantee.

Generate the same runtime-only archive from a reviewed source snapshot:

```sh
npm run package
```

The packaging script fixes file order and timestamps and stores files without compression so identical runtime sources produce a byte-identical ZIP suitable for checksum comparison.

## What the checksum proves

A matching checksum proves only that two files are byte-for-byte identical. It does **not** prove that the extension is safe, that the archive came from the claimed author, or that the source was independently reviewed. An attacker able to replace both an archive and its published checksum can make them match.

Obtain checksums through a channel you trust, review the source, inspect the archive contents, and repeat the independent security process described in [LLM_SECURITY_REVIEW_PROMPT.md](LLM_SECURITY_REVIEW_PROMPT.md) before installation.

## Archive contents

```text
manifest.json
icons/icon-16.png
icons/icon-32.png
icons/icon-48.png
icons/icon-128.png
popup/popup.html
popup/popup.css
popup/popup.js
src/extractor.js
```

The ZIP is intentionally ignored by Git so generated binary artifacts are not committed as source. Publish the exact verified ZIP as a GitHub Release asset if distributing it; if it is regenerated for any reason, recompute and update every checksum in this document.
