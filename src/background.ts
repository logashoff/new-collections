import { getSavedTabs } from './app/utils';

const updateGroupCount = async () => {
  const collections = await getSavedTabs();
  chrome.action.setBadgeText({ text: collections?.length.toString() ?? '' });
};

chrome.runtime.onInstalled.addListener(() => updateGroupCount());
chrome.runtime.onStartup.addListener(() => updateGroupCount());
chrome.storage.onChanged.addListener(() => updateGroupCount());
