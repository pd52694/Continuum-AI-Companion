(() => {
  // Toggle off if already present
  const existing = document.getElementById("continuum-sidebar-root");
  if (existing) {
    existing.remove();
    return;
  }

  const root = document.createElement("div");
  root.id = "continuum-sidebar-root";
  root.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100vh;
    z-index: 2147483647;
    background: white;
    border-left: 4px solid #4f46e5;
    box-shadow: -8px 0 24px rgba(0,0,0,.12);
  `;

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("sidebar/sidebar.html");
  iframe.style.cssText = "width:100%;height:100%;border:0;";

  root.appendChild(iframe);
  document.documentElement.appendChild(root);
})();

alert("Injected!");
