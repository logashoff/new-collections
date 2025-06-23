import { addRecent, getCollections } from './app/utils/collections';
import type { BackgroundMessage, Tab } from './app/utils/models';
import { getNormalizedUrl } from './app/utils/utils';

async function onRuntimeChanges() {
  const collections = await getCollections();
  await chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
}

/**
 * Update recent items list by tab URL if it matches any tab IDs in saved collection
 */
async function updateRecentByUrl(url: string) {
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
}

async function onTabCreate(tab: Tab) {
  if (tab.pendingUrl) {
    await updateRecentByUrl(tab.pendingUrl);
  }
}

async function onMessage(message: BackgroundMessage) {
  const { onCreated } = chrome.tabs;
  onCreated.removeListener(onTabCreate);

  if (message.tabId) {
    await addRecent(message.tabId);
  } else if (message.tabUrl) {
    await updateRecentByUrl(message.tabUrl);
  }

  onCreated.addListener(onTabCreate);
}

async function onConnect(port: chrome.runtime.Port) {
  port.onMessage.addListener(onMessage);
}

// Helps to handle items opened using context menu
chrome.tabs.onCreated.addListener(onTabCreate);

chrome.runtime.onInstalled.addListener(onRuntimeChanges);
chrome.runtime.onStartup.addListener(onRuntimeChanges);
chrome.runtime.onConnect.addListener(onConnect);

chrome.storage.onChanged.addListener(onRuntimeChanges);
