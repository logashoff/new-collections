import { getSavedTabs, setIcon, usesDarkMode } from 'lib';

/**
 * Updates extension badge icon text to display how many groups are stored in local storage.
 */
export async function updateGroupCount() {
  const groups = await getSavedTabs();

  if (Array.isArray(groups)) {
    chrome.browserAction.setBadgeText({ text: groups.length.toString() });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  updateGroupCount();

  if (usesDarkMode()) {
    setIcon({
      path: {
        16: 'assets/icons/icon_16_dark.png',
        32: 'assets/icons/icon_32_dark.png',
        48: 'assets/icons/icon_48_dark.png',
        128: 'assets/icons/icon_128_dark.png',
      },
    });
  }
});

chrome.storage.onChanged.addListener(async () => {
  updateGroupCount();
});
