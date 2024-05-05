import { getCollections } from './app/utils/collections';

const updateBadgeText = async () => {
  const collections = await getCollections();
  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

chrome.runtime.onInstalled.addListener(updateBadgeText);
chrome.runtime.onStartup.addListener(updateBadgeText);
chrome.storage.onChanged.addListener(updateBadgeText);
