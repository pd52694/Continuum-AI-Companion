async function inject(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["background/injected.js"]
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await inject(tab.id);
  } catch (e) {
    console.error("Inject failed:", e);
  }
});
