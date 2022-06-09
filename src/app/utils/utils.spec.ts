import { getBrowserTabMock, getTabGroupMock } from 'src/mocks';
import { getHostname, getHostnameGroup, getUrlOrigin } from './utils';

describe('utils.ts', () => {
  it('should create hostname groups', () => {
    const collection = getTabGroupMock();
    expect(getHostnameGroup(collection.tabs)).toEqual([
      [
        {
          favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
          id: 51,
          pinned: false,
          title: 'GitHub: Where the world builds software · GitHub',
          url: 'https://github.com/',
        },
      ],
      [
        {
          favIconUrl: 'https://duckduckgo.com/favicon.ico',
          id: 52,
          pinned: false,
          title: 'DuckDuckGo — Privacy, simplified.',
          url: 'https://duckduckgo.com/',
        },
      ],
    ]);
  });

  it('should return hostname', () => {
    expect(getHostname(getBrowserTabMock())).toBe('getfedora.org');
  });

  it('should return origin', () => {
    expect(getUrlOrigin('https://developer.chrome.com/docs/extensions/mv3/manifest/')).toBe(
      'https://developer.chrome.com'
    );
  });
});
