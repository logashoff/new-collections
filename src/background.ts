import { setDarkThemeIcon } from './background/dark-theme-icon';
import { updateGroupCount } from './background/group-count';

chrome.runtime.onInstalled.addListener(async () => {
  updateGroupCount();
  setDarkThemeIcon();
});

chrome.storage.onChanged.addListener(async () => {
  updateGroupCount();
});
