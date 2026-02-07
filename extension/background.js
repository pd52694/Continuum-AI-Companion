let studyActive = false;
let studyTabId = null;

let timer = null;
let timeRemaining = 0;

let onBreak = false;
let breakDuration = 300; // 5 minutes (you can change this)

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "START_STUDY") {
    studyActive = true;
    onBreak = false;
    studyTabId = sender.tab.id;
    timeRemaining = msg.duration;
    startTimer();
  }

  if (msg.type === "STOP_STUDY") {
    studyActive = false;
    onBreak = false;
    clearInterval(timer);
  }
});

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    timeRemaining--;

    if (timeRemaining <= 0) {
      clearInterval(timer);

      if (!onBreak) {
        // Study session just ended → start break
        onBreak = true;
        timeRemaining = breakDuration;

        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Break Time!",
          message: "Great work! Take a short break. :)"
        });

        startTimer();
      } else {
        // Break ended → notify user
        onBreak = false;

        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Break Over",
          message: "Ready for another study session?"
        });
      }
    }
  }, 1000);
}

// Detect tab switching
chrome.tabs.onActivated.addListener(activeInfo => {
  if (studyActive && !onBreak && activeInfo.tabId !== studyTabId) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Stay Focused",
      message: "You switched tabs. :( Let's stay on task and wait for break time!"
    });
  }
});