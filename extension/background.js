let studyActive = false;
let studyTabId = null;
let timer = null;
let timeRemaining = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_STUDY") {
    studyActive = true;
    studyTabId = sender.tab.id;
    timeRemaining = msg.duration;
    startTimer();
  }

  if (msg.type === "STOP_STUDY") {
    studyActive = false;
    clearInterval(timer);
  }
});

function startTimer() {
  timer = setInterval(() => {
    timeRemaining--;

    if (timeRemaining <= 0) {
      clearInterval(timer);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Study Session Complete",
        message: "Time for a break! :)"
      });
    }
  }, 1000);
}

// Detect tab switching
chrome.tabs.onActivated.addListener(activeInfo => {
  if (studyActive && activeInfo.tabId !== studyTabId) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Stay Focused",
      message: "You switched tabs. :( Let's stay on task and wait until a break to check other sites!"
    });
  }
});