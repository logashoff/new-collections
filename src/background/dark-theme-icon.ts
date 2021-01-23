/**
 * Sets dark theme icon (icon that's easier to view on dark backgrounds) if browser theme is set to dark mode.
 */
export function setDarkThemeIcon() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    chrome.browserAction.setIcon({
      path: {
        128: 'assets/icons/icon_128_dark.png',
        48: 'assets/icons/icon_48_dark.png',
        32: 'assets/icons/icon_32_dark.png',
        16: 'assets/icons/icon_16_dark.png',
      },
    });
  }
}
