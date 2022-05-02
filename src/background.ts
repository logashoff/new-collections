import { getSavedTabs } from './app/utils';

const updateGroupCount = async () => {
  const tabs = await getSavedTabs();
  chrome.action.setBadgeText({ text: tabs?.length > 0 ? tabs.length.toString() : '' });
};

chrome.runtime.onInstalled.addListener(() => updateGroupCount());
chrome.storage.onChanged.addListener(() => updateGroupCount());
