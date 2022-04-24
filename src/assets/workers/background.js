function updateGroupCount() {
  var groups = chrome.storage.local.get('tabs', (res) => res.tabs);
  chrome.action.setBadgeText({ text: groups?.length > 0 ? groups.length.toString() : '' });
}

chrome.runtime.onInstalled.addListener(() => updateGroupCount());
chrome.storage.onChanged.addListener(() => updateGroupCount());
