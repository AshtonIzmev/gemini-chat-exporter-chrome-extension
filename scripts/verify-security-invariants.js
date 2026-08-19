const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(projectRoot, file), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const packageJson = JSON.parse(read("package.json"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expectedPermissions = ["activeTab", "downloads", "scripting"];
assert(manifest.manifest_version === 3, "Manifest V3 is required.");
assert(
  JSON.stringify([...manifest.permissions].sort()) === JSON.stringify(expectedPermissions),
  `Permissions must remain exactly: ${expectedPermissions.join(", ")}.`
);

for (const forbiddenKey of [
  "background",
  "content_scripts",
  "externally_connectable",
  "host_permissions",
  "optional_host_permissions",
  "optional_permissions",
  "update_url",
  "web_accessible_resources"
]) {
  assert(!(forbiddenKey in manifest), `Unexpected manifest capability: ${forbiddenKey}.`);
}

assert(!packageJson.dependencies, "Runtime npm dependencies are not allowed.");
for (const lifecycleScript of ["install", "postinstall", "preinstall", "prepare"]) {
  assert(!packageJson.scripts?.[lifecycleScript], `Lifecycle script is not allowed: ${lifecycleScript}.`);
}

const runtimeFiles = [
  "manifest.json",
  "icons/icon-16.png",
  "icons/icon-32.png",
  "icons/icon-48.png",
  "icons/icon-128.png",
  "popup/popup.html",
  "popup/popup.css",
  "popup/popup.js",
  "src/extractor.js"
];
for (const file of runtimeFiles) {
  assert(fs.existsSync(path.join(projectRoot, file)), `Missing runtime file: ${file}.`);
}

const popupHtml = read("popup/popup.html");
const scriptSources = [...popupHtml.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)]
  .map((match) => match[1]);
assert(
  JSON.stringify(scriptSources) === JSON.stringify(["../src/extractor.js", "popup.js"]),
  "Popup scripts must remain local and explicitly reviewed."
);
assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(popupHtml), "Remote popup resources are not allowed.");

const runtimeJavaScript = `${read("popup/popup.js")}\n${read("src/extractor.js")}`;
const forbiddenPatterns = [
  ["network request API", /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/],
  ["dynamic code execution", /\b(?:eval|Function)\s*\(/],
  ["cookie access", /document\.cookie|chrome\.cookies/],
  ["persistent storage", /\b(?:localStorage|indexedDB)\b|chrome\.storage/],
  ["sensitive browser API", /chrome\.(?:bookmarks|debugger|history|identity|management|nativeMessaging|webRequest)/]
];
for (const [capability, pattern] of forbiddenPatterns) {
  assert(!pattern.test(runtimeJavaScript), `Unexpected ${capability} found in runtime JavaScript.`);
}

console.log("Security invariants verified:");
console.log(`- permissions: ${expectedPermissions.join(", ")}`);
console.log("- no persistent host access or background execution");
console.log("- no runtime dependencies, remote resources, network APIs, or dynamic code");
console.log(`- ${runtimeFiles.length} explicitly reviewed runtime files`);