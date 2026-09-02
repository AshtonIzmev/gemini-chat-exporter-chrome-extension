const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const { extractGeminiChat } = require("../src/extractor.js");

function useDom(html, url = "https://gemini.google.com/app/test-conversation") {
  const dom = new JSDOM(html, { url });
  global.document = dom.window.document;
  global.location = dom.window.location;
  global.Node = dom.window.Node;
  return dom;
}

test("extracts ordered messages and conversation metadata", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "fixtures/gemini-chat.html"), "utf8");
  const dom = useDom(fixture);

  const result = extractGeminiChat();

  assert.equal(result.schemaVersion, 1);
  assert.equal(result.title, "Example conversation");
  assert.equal(result.conversationId, "test-conversation");
  assert.equal(result.source, "Google Gemini");
  assert.match(result.exportedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(result.messages.map(({ role }) => role), ["user", "assistant", "user", "assistant"]);
  assert.deepEqual(result.messages.map(({ index }) => index), [0, 1, 2, 3]);
  assert.match(result.messages[0].text, /Compare these options/);
  assert.match(result.messages[3].text, /const answer = 42/);

  dom.window.close();
});

test("extracts conversations opened through a Gem URL", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "fixtures/gemini-chat.html"), "utf8");
  const dom = useDom(fixture, "https://gemini.google.com/gem/1dc8c6a0f668/4a9abe18cc37ca3b");

  const result = extractGeminiChat();

  assert.equal(result.conversationId, "4a9abe18cc37ca3b");
  assert.equal(result.messages.length, 4);

  dom.window.close();
});

test("preserves semantic HTML and removes page-specific or unsafe markup", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "fixtures/gemini-chat.html"), "utf8");
  const dom = useDom(fixture);

  const { messages } = extractGeminiChat();
  const promptHtml = messages[0].html;
  const answerHtml = messages[1].html;

  assert.equal(promptHtml, "Compare these options.");
  assert.match(answerHtml, /<strong>second<\/strong>/);
  assert.match(answerHtml, /<ul><li>Lower cost<\/li><li>Better range<\/li><\/ul>/);
  assert.match(answerHtml, /href="https:\/\/gemini\.google\.com\/app\/reference"/);
  assert.doesNotMatch(answerHtml, /javascript:|onclick|script|_ngcontent|class=/i);
  assert.match(answerHtml, />Unsafe link<\/a>|Unsafe link/);

  dom.window.close();
});

test("rejects unsupported pages and empty conversations", () => {
  let dom = useDom("<title>Other page</title>", "https://example.com/");
  assert.throws(() => extractGeminiChat(), /Open a Gemini conversation/);
  dom.window.close();

  dom = useDom("<title>Empty - Google Gemini</title>");
  assert.throws(() => extractGeminiChat(), /No rendered messages were found/);
  dom.window.close();
});