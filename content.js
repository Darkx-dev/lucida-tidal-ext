// Function to extract the item name
function extractItemName() {
    const element = document.querySelector('#body > div > div.file_preview_row.svelte-jngqwx > div.file_preview.svelte-jngqwx.checkers.toolbar_visible > div');
    return element ? element.textContent.trim() : null;
  }
  
  // Function to extract the audio file URL
  function extractAudioUrl() {
    const audioElement = document.querySelector('audio');
    return audioElement && audioElement.src ? audioElement.src : null;
  }
  
  // Function to send the item name and audio URL to the background script
  function sendDetails() {
    const itemName = extractItemName();
    const audioUrl = extractAudioUrl();
    
    if (itemName) {
      chrome.runtime.sendMessage({ command: 'log', message: `\nProcessed item: ${itemName}` });
    }
    
    if (audioUrl) {
      chrome.runtime.sendMessage({ command: 'audioUrl', url: audioUrl });
    }
  }
  
  // Send details when the script runs
  sendDetails();
  