const updateGroupCount = () => {
  chrome.storage.local.get('tabs', (res) => {
    chrome.action.setBadgeText({ text: res?.tabs?.length > 0 ? res.tabs.length.toString() : '' });
  });
};

chrome.runtime.onInstalled.addListener(() => updateGroupCount());
chrome.storage.onChanged.addListener(() => updateGroupCount());
