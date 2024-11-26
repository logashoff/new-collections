import { getBrowserTabMock, getTabGroupMock } from 'src/mocks';
import { getHostname, getHostnameGroup, isUuid, uuid } from './utils';

describe('utils.ts', () => {
  it('should create hostname groups', () => {
    const collection = getTabGroupMock();
    expect(getHostnameGroup(collection.tabs)).toEqual([
      [
        {
          favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
          id: 51,
          title: 'GitHub: Where the world builds software · GitHub',
          url: 'https://github.com/',
        },
      ],
      [
        {
          favIconUrl: 'https://duckduckgo.com/favicon.ico',
          id: 52,
          title: 'DuckDuckGo — Privacy, simplified.',
          url: 'https://duckduckgo.com/',
        },
      ],
    ]);
  });

  it('should return hostname', () => {
    expect(getHostname(getBrowserTabMock())).toBe('getfedora.org');
  });

  it('should validate uuid', () => {
    expect(isUuid(uuid())).toBeTruthy();
    expect(isUuid(uuid())).toBeTruthy();
    expect(isUuid(uuid())).toBeTruthy();
    expect(isUuid(uuid())).toBeTruthy();
    expect(isUuid(uuid())).toBeTruthy();
    expect(isUuid(uuid())).toBeTruthy();
  });
});
