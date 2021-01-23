/**
 * Returns tab groups stored in local storage.
 */
export function getGroups(): Promise<any> {
  return new Promise((resolve) => chrome.storage.local.get('tabs', ({ tabs }) => resolve(tabs)));
}

/**
 * Updates extension badge icon text to display how many groups are stored in local storage.
 */
export async function updateGroupCount() {
  const groups = await getGroups();

  if (Array.isArray(groups)) {
    chrome.browserAction.setBadgeText({ text: groups.length.toString() });
  }
}
