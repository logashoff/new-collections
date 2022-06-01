import { getCollections } from './app/utils';

const updateGroupCount = async () => {
  const collections = await getCollections();
  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

chrome.runtime.onInstalled.addListener(() => updateGroupCount());
chrome.runtime.onStartup.addListener(() => updateGroupCount());
chrome.storage.onChanged.addListener(() => updateGroupCount());
