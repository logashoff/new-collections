import normalizeUrl from 'normalize-url';
import { addRecent, getCollections } from './app/utils/collections';

const tabIdsByUrl = new Map<string, number[]>();

const updateBadgeText = async () => {
  const collections = await getCollections();

  tabIdsByUrl.clear();
  collections.forEach((collection) =>
    collection.tabs.forEach(({ url, id }) => {
      const normalizedUrl = normalizeUrl(url);

      if (!tabIdsByUrl.has(normalizedUrl)) {
        tabIdsByUrl.set(normalizedUrl, []);
      }

      tabIdsByUrl.get(normalizedUrl).push(id);
    })
  );

  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

const updateRecent = async (tab: chrome.tabs.Tab) => {
  const normalizedUrl = normalizeUrl(tab.url);
  const tabIds = tabIdsByUrl.get(normalizedUrl);

  if (tabIds?.length > 0) {
    await addRecent(...tabIds);
  }
};

chrome.runtime.onInstalled.addListener(updateBadgeText);
chrome.runtime.onStartup.addListener(updateBadgeText);
chrome.storage.onChanged.addListener(updateBadgeText);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    await updateRecent(tab);
  }
});
