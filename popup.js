document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('btn-export-popup');
  const statusText = document.getElementById('popup-status');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      statusText.innerText = 'PROCESSING...';
      statusText.style.color = '#00f3ff';

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0] || !tabs[0].url.includes('gemini.google.com')) {
          statusText.innerText = 'INVALID PAGE!';
          statusText.style.color = '#ff007f';
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: 'START_EXPORT' }, (response) => {
          if (chrome.runtime.lastError) {
            statusText.innerText = 'ERROR CONNECTING';
            statusText.style.color = '#ff007f';
          } else {
            statusText.innerText = 'EXPORT COMPLETED';
            statusText.style.color = '#00ff66';
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        });
      });
    });
  }
});