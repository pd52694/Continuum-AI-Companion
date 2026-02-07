const statusEl = document.getElementById("status");

function render(ctx) {
  if (!ctx) return;
  statusEl.textContent = "Captured: " + (ctx.title || "(no title)");
}

// Load latest context on open
chrome.storage.local.get(["latestContext"], (res) => {
  render(res.latestContext);
});

// Update when storage changes (reliable even if messages miss)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.latestContext) {
    render(changes.latestContext.newValue);
  }
});
