import { addRecent, getCollections } from './app/utils/collections';

const tabIdsByUrl = new Map<string, number[]>();

const updateBadgeText = async () => {
  const collections = await getCollections();

  tabIdsByUrl.clear();
  collections.forEach((collection) =>
    collection.tabs.forEach(({ url, id }) => {
      const { href } = new URL(url);

      if (!tabIdsByUrl.has(href)) {
        tabIdsByUrl.set(href, []);
      }

      tabIdsByUrl.get(href).push(id);
    })
  );

  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

const updateRecent = async (tab: chrome.tabs.Tab) => {
  const { href } = new URL(tab.url);
  const tabIds = tabIdsByUrl.get(href);

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
