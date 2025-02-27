import { addRecent, getCollections } from './app/utils/collections';
import { BackgroundMessage, Tab } from './app/utils/models';
import { getNormalizedUrl } from './app/utils/utils';

const onRuntimeChanges = async () => {
  const collections = await getCollections();
  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

/**
 * Update recent items list by tab URL if it matches any tab IDs in saved collection
 */
const updateRecentByUrl = async (url: string) => {
  const collections = await getCollections();

  if (collections?.length > 0) {
    const normalizedUrl = getNormalizedUrl(url);
    const tabIdsByUrl = new Map<string, number[]>();

    collections.forEach((collection) =>
      collection.tabs.forEach(({ url, id }) => {
        const normalizedUrl = getNormalizedUrl(url);

        if (!tabIdsByUrl.has(normalizedUrl)) {
          tabIdsByUrl.set(normalizedUrl, []);
        }

        const tabIds = tabIdsByUrl.get(normalizedUrl);
        tabIds.push(id);
      })
    );

    if (tabIdsByUrl.has(normalizedUrl)) {
      const tabIds = tabIdsByUrl.get(normalizedUrl);

      if (tabIds?.length > 0) {
        await addRecent(...tabIds);
      }
    }
  }
};

const onTabCreate = async (tab: Tab) => {
  if (tab.pendingUrl) {
    await updateRecentByUrl(tab.pendingUrl);
  }
};

chrome.runtime.onInstalled.addListener(onRuntimeChanges);
chrome.runtime.onStartup.addListener(onRuntimeChanges);
chrome.storage.onChanged.addListener(onRuntimeChanges);

// Helps to handle items opened using context menu
chrome.tabs.onCreated.addListener(onTabCreate);

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message: BackgroundMessage) => {
    const { onCreated } = chrome.tabs;
    onCreated.removeListener(onTabCreate);

    if (message.tabId) {
      await addRecent(message.tabId);
    } else if (message.tabUrl) {
      await updateRecentByUrl(message.tabUrl);
    }

    onCreated.addListener(onTabCreate);
  });
});
