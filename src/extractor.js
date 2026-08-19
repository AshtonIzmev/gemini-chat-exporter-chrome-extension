function extractGeminiChat() {
  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "DEL",
    "EM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HR",
    "I",
    "LI",
    "OL",
    "P",
    "PRE",
    "S",
    "STRONG",
    "TABLE",
    "TBODY",
    "TD",
    "TFOOT",
    "TH",
    "THEAD",
    "TR",
    "U",
    "UL"
  ]);
  const removableTags = new Set([
    "BUTTON",
    "CANVAS",
    "FORM",
    "IFRAME",
    "INPUT",
    "NOSCRIPT",
    "SCRIPT",
    "SELECT",
    "STYLE",
    "SVG",
    "TEXTAREA"
  ]);

  function isHidden(element) {
    return element.hidden ||
      element.getAttribute("aria-hidden") === "true" ||
      element.classList.contains("hidden") ||
      element.classList.contains("ng-hide");
  }

  function safeUrl(value) {
    if (!value) return null;

    try {
      const url = new URL(value, document.baseURI);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function sanitizeNode(node, outputDocument) {
    if (node.nodeType === Node.TEXT_NODE) {
      return outputDocument.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node;
    if (isHidden(element) || removableTags.has(element.tagName)) return null;

    const fragment = outputDocument.createDocumentFragment();
    for (const child of element.childNodes) {
      const cleanChild = sanitizeNode(child, outputDocument);
      if (cleanChild) fragment.appendChild(cleanChild);
    }

    if (!allowedTags.has(element.tagName)) return fragment;

    const cleanElement = outputDocument.createElement(element.tagName.toLowerCase());
    if (element.tagName === "A") {
      const href = safeUrl(element.getAttribute("href"));
      if (href) cleanElement.setAttribute("href", href);
    }
    if ((element.tagName === "TD" || element.tagName === "TH") && element.colSpan > 1) {
      cleanElement.setAttribute("colspan", String(element.colSpan));
    }
    if ((element.tagName === "TD" || element.tagName === "TH") && element.rowSpan > 1) {
      cleanElement.setAttribute("rowspan", String(element.rowSpan));
    }
    cleanElement.appendChild(fragment);
    return cleanElement;
  }

  function messageFrom(element, role, index) {
    if (!element || isHidden(element)) return null;

    const outputDocument = document.implementation.createHTMLDocument("");
    const container = outputDocument.createElement("div");
    for (const child of element.childNodes) {
      const cleanChild = sanitizeNode(child, outputDocument);
      if (cleanChild) container.appendChild(cleanChild);
    }

    const text = (container.innerText || container.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) return null;

    return {
      index,
      role,
      text,
      html: container.innerHTML.trim()
    };
  }

  const match = location.pathname.match(/^\/app\/([^/?#]+)/);
  if (location.hostname !== "gemini.google.com" || !match) {
    throw new Error("Open a Gemini conversation before exporting.");
  }

  const messages = [];
  const turns = document.querySelectorAll(".conversation-container");
  for (const turn of turns) {
    const prompt = turn.querySelector("user-query .query-content[id^='user-query-content-'], user-query .query-content");
    const response = turn.querySelector("model-response message-content .markdown, model-response message-content");

    const userMessage = messageFrom(prompt, "user", messages.length);
    if (userMessage) messages.push(userMessage);

    const assistantMessage = messageFrom(response, "assistant", messages.length);
    if (assistantMessage) messages.push(assistantMessage);
  }

  if (messages.length === 0) {
    throw new Error("No rendered messages were found. Wait for the conversation to finish loading.");
  }

  const title = document.title
    .replace(/\s*[-–—]\s*Google Gemini\s*$/i, "")
    .trim() || "Gemini chat";

  return {
    schemaVersion: 1,
    source: "Google Gemini",
    title,
    url: location.href,
    conversationId: match[1],
    exportedAt: new Date().toISOString(),
    messages
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractGeminiChat };
}