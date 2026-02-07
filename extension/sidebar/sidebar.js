document.getElementById("start").addEventListener("click", () => {
  const minutes = parseInt(document.getElementById("minutes").value);
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.runtime.sendMessage({
      type: "START_STUDY",
      duration: minutes * 60
    });
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "STOP_STUDY" });
});

// Chatbot
document.getElementById("send").addEventListener("click", () => {
  const input = document.getElementById("chatInput").value;
  addMessage("You: " + input);
  addMessage("Bot: " + chatbotReply(input));
  document.getElementById("chatInput").value = "";
});

function addMessage(text) {
  const box = document.getElementById("chatbox");
  box.innerHTML += `<div>${text}</div>`;
  box.scrollTop = box.scrollHeight;
}