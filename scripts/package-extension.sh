#!/bin/sh

set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(node -p "require('$project_root/manifest.json').version")
archive_name="gemini-chat-exporter-v${version}.zip"
archive_path="$project_root/$archive_name"
staging_dir=$(mktemp -d)

cleanup() {
  rm -rf "$staging_dir"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$staging_dir/icons" "$staging_dir/popup" "$staging_dir/src"

cp "$project_root/manifest.json" "$staging_dir/manifest.json"
cp "$project_root/icons/icon-16.png" "$staging_dir/icons/icon-16.png"
cp "$project_root/icons/icon-32.png" "$staging_dir/icons/icon-32.png"
cp "$project_root/icons/icon-48.png" "$staging_dir/icons/icon-48.png"
cp "$project_root/icons/icon-128.png" "$staging_dir/icons/icon-128.png"
cp "$project_root/popup/popup.html" "$staging_dir/popup/popup.html"
cp "$project_root/popup/popup.css" "$staging_dir/popup/popup.css"
cp "$project_root/popup/popup.js" "$staging_dir/popup/popup.js"
cp "$project_root/src/extractor.js" "$staging_dir/src/extractor.js"

# Fixed timestamps, stable ordering, and no compression make identical source
# snapshots produce byte-identical archives across supported environments.
find "$staging_dir" -type f -exec touch -t 198001010000 {} +
rm -f "$archive_path"

(
  cd "$staging_dir"
  LC_ALL=C zip -X -0 -q "$archive_path" \
    manifest.json \
    icons/icon-16.png \
    icons/icon-32.png \
    icons/icon-48.png \
    icons/icon-128.png \
    popup/popup.html \
    popup/popup.css \
    popup/popup.js \
    src/extractor.js
)

unzip -tq "$archive_path"
printf 'Created %s\n' "$archive_name"
shasum -a 256 "$archive_path"

if command -v md5 >/dev/null 2>&1; then
  md5 "$archive_path"
else
  md5sum "$archive_path"
fi