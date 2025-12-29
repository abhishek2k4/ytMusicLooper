// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Only work on YouTube Music
  if (tab.url && tab.url.includes('music.youtube.com')) {
    // Send message to content script to toggle menu
    chrome.tabs.sendMessage(tab.id, { action: 'toggleMenu' });
  }
});