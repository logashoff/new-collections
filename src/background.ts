import normalizeUrl from 'normalize-url';
import { addRecent, getCollections } from './app/utils/collections';
import { BackgroundMessage, Tab, TabId } from './app/utils/models';

const tabIdsByUrl = new Map<string, number[]>();

const getNormalizedUrl = (url: string) =>
  normalizeUrl(url, {
    removeSingleSlash: true,
    removeTrailingSlash: true,
    stripAuthentication: true,
    stripProtocol: true,
    stripWWW: true,
  });

const updateBadgeText = async () => {
  const collections = await getCollections();

  tabIdsByUrl.clear();
  collections.forEach((collection) =>
    collection.tabs.forEach(({ url, id }) => {
      const normalizedUrl = getNormalizedUrl(url);

      if (!tabIdsByUrl.has(normalizedUrl)) {
        tabIdsByUrl.set(normalizedUrl, []);
      }

      tabIdsByUrl.get(normalizedUrl).push(id);
    })
  );

  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

const updateRecent = async (url: string, tabId?: TabId) => {
  const normalizedUrl = getNormalizedUrl(url);
  const tabIds = tabIdsByUrl.get(normalizedUrl);

  if (tabIds?.length > 0) {
    if (tabId && tabIds.includes(tabId)) {
      await addRecent(tabId);
    } else {
      await addRecent(...tabIds);
    }
  }
};

const onTabCreate = async (tab: Tab) => {
  if (tab.pendingUrl) {
    await updateRecent(tab.pendingUrl);
  }
};

chrome.runtime.onInstalled.addListener(updateBadgeText);
chrome.runtime.onStartup.addListener(updateBadgeText);
chrome.storage.onChanged.addListener(updateBadgeText);

// Helps to handle items opened using context menu
chrome.tabs.onCreated.addListener(onTabCreate);

chrome.runtime.onMessage.addListener(async (message: BackgroundMessage) => {
  if (message.url) {
    const { onCreated } = chrome.tabs;

    onCreated.removeListener(onTabCreate);
    await updateRecent(message.url, message.tabId);
    onCreated.addListener(onTabCreate);
  }
});
