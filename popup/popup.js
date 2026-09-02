const exportButton = document.querySelector("#export-button");
const statusElement = document.querySelector("#status");

function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = `status visible ${type}`.trim();
}

function safeFilename(title, conversationId) {
  const safeTitle = title
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .toLowerCase() || "gemini-chat";
  return `${safeTitle}-${conversationId}.json`;
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active browser tab was found.");
  return tab;
}

async function exportCurrentChat() {
  exportButton.disabled = true;
  setStatus("Reading the current conversation...");

  try {
    const tab = await activeTab();
    const conversationUrlPattern = /^https:\/\/gemini\.google\.com\/(?:app\/[^/?#]+|gem\/[^/?#]+\/[^/?#]+)\/?(?:[?#]|$)/;
    if (!conversationUrlPattern.test(tab.url || "")) {
      throw new Error("Open a Gemini conversation in this tab first.");
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractGeminiChat
    });
    const json = JSON.stringify(result, null, 2);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

    await chrome.downloads.download({
      url: dataUrl,
      filename: safeFilename(result.title, result.conversationId),
      conflictAction: "uniquify",
      saveAs: false
    });

    setStatus(`Downloaded ${result.messages.length} messages.`, "success");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "The conversation could not be exported.", "error");
  } finally {
    exportButton.disabled = false;
  }
}

exportButton.addEventListener("click", exportCurrentChat);