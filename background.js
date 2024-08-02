chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command === 'startProcess') {
      processNext();
    } else if (message.command === 'stopProcess') {
      chrome.storage.local.set({ isProcessing: false });
      chrome.runtime.sendMessage({ command: 'log', message: 'Processing stopped.' });
    } else if (message.command === 'log') {
      // Send logs to all connected clients (including popup)
      chrome.runtime.sendMessage({ command: 'log', message: message.message });
    } else if (message.command === 'audioUrl') {
      // Trigger download of the audio file
      chrome.downloads.download({
        url: message.url,
        saveAs: true // Prompt the user to save the file
      }, function(downloadId) {
        if (chrome.runtime.lastError) {
          console.error('Download failed:', chrome.runtime.lastError);
          chrome.runtime.sendMessage({ command: 'log', message: `Download failed: ${chrome.runtime.lastError.message}` });
        } else {
          chrome.runtime.sendMessage({ command: 'log', message: `Download started: ${message.url}` });
        }
      });
    }
  });
  
  function processNext() {
    chrome.storage.local.get(['urlsToProcess', 'isProcessing'], function(items) {
      if (items.isProcessing === false || !items.urlsToProcess || items.urlsToProcess.length === 0) {
        chrome.storage.local.remove('urlsToProcess');
        chrome.storage.local.set({ isProcessing: false });
        chrome.runtime.sendMessage({ command: 'log', message: 'Processing finished.' });
        return;
      }
  
      let urls = items.urlsToProcess;
      let url = urls.shift();
      chrome.storage.local.set({ urlsToProcess: urls });
  
      let id = url.split('/').pop();
      let apiUrl = `https://hund.lucida.to/api/fetch/stream?url=http://www.tidal.com/track/${id}&downscale=original&meta=true&private=false&country=US&upload=pixeldrain`;
  
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          if (data && data.url) {
            chrome.tabs.update({ url: data.url });
            chrome.runtime.sendMessage({ command: 'log', message: `Redirecting to: ${data.url}` });
          } else {
            chrome.runtime.sendMessage({ command: 'log', message: 'No URL found in the response.' });
          }
        })
        .catch(error => {
          chrome.runtime.sendMessage({ command: 'log', message: `Request failed: ${error.message}` });
        })
        .finally(() => {
          setTimeout(processNext, 1000); // Adjust delay as needed
        });
    });
  }
  
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    chrome.storage.local.get(['urlsToProcess', 'isProcessing'], function(items) {
      if (items.isProcessing) {
        chrome.storage.local.remove(['urlsToProcess', 'isProcessing'], function() {
          chrome.runtime.sendMessage({ command: 'log', message: 'Local storage cleaned up for closed tab.' });
        });
      }
    });
  });
  