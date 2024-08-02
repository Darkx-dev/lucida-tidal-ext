let debounceTimeout = null;

function debounce(func, delay) {
  return function (...args) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function updateStatus(message) {
  document.getElementById('status').innerHTML = message;
}

function appendLog(message) {
  const logElement = document.getElementById('logs');
  logElement.innerHTML += `<br/>${new Date().toLocaleTimeString()}: ${message}\n`;
  logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
}

document.getElementById('startButton').addEventListener('click', debounce(function() {
  let urls = document.getElementById('urlInput').value.split('\n').map(line => line.trim()).filter(line => line);
  chrome.storage.local.set({ urlsToProcess: urls, isProcessing: true }, function() {
    chrome.runtime.sendMessage({ command: 'startProcess' });
    updateStatus('</br>Processing started...');
    appendLog('</br>Processing started...');
  });
}, 300));

document.getElementById('clearButton').addEventListener('click', function() {
  document.getElementById('urlInput').value = '';
  chrome.storage.local.remove(['urlsToProcess', 'isProcessing']);
  chrome.runtime.sendMessage({ command: 'stopProcess' });
  updateStatus('</br>Processing stopped and data cleared.');
  appendLog('</br>Processing stopped and data cleared.');
});

// Listen for log messages from the background script
chrome.runtime.onMessage.addListener(function(message) {
  if (message.command === 'log') {
    appendLog(message.message);
  }
});
