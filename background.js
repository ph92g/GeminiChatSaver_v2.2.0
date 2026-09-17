chrome.runtime.onInstalled.addListener(() => {
  console.log('[GeminiChatSaver] Cyber Glass System Initialized Version 2.0.0');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_EXPORT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'START_EXPORT' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
});