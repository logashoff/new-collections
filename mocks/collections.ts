import { cloneDeep } from 'lodash-es';
import { Collection, Collections } from 'src/app/utils';

const tabGroupMock: Collection = {
  id: 'e200698d-d053-45f7-b917-e03b104ae127',
  tabs: [
    {
      favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
      id: 51,
      title: 'GitHub: Where the world builds software · GitHub',
      url: 'https://github.com/',
    },
    {
      favIconUrl: 'https://duckduckgo.com/favicon.ico',
      id: 52,
      title: 'DuckDuckGo — Privacy, simplified.',
      url: 'https://duckduckgo.com/',
    },
  ],
  timestamp: 1650858875455,
};

export const getTabGroupMock = () => cloneDeep(tabGroupMock);

const tabGroupsMock: Collections = [
  {
    id: '7dd29b1c-dfab-44d4-8d29-76d402d24038',
    tabs: [
      {
        favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        id: 57,
        title: 'Enterprise Open Source and Linux | Ubuntu',
        url: 'https://ubuntu.com/',
      },
      {
        favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        id: 58,
        title: 'Enterprise Open Source and Linux | Ubuntu',
        url: 'https://ubuntu.com/',
      },
      {
        favIconUrl: 'https://linuxmint.com/web/img/favicon.ico',
        id: 61,
        title: 'Home - Linux Mint',
        url: 'https://linuxmint.com/',
      },
      {
        favIconUrl: 'https://c.s-microsoft.com/favicon.ico',
        id: 63,
        title: 'Explore Windows 11 OS, Computers, Apps, & More | Microsoft',
        url: 'https://www.microsoft.com/en-us/windows?r=1',
      },
      {
        favIconUrl: 'https://www.apple.com/favicon.ico',
        id: 64,
        title: 'Apple',
        url: 'https://www.apple.com/',
      },
    ],
    timestamp: 1650858932558,
  },
  {
    id: 'e200698d-d053-45f7-b917-e03b104ae127',
    tabs: [
      {
        favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
        id: 51,
        title: 'GitHub: Where the world builds software · GitHub',
        url: 'https://github.com/',
      },
      {
        favIconUrl: 'https://duckduckgo.com/favicon.ico',
        id: 52,
        title: 'DuckDuckGo — Privacy, simplified.',
        url: 'https://duckduckgo.com/',
      },
    ],
    timestamp: 1650858875455,
  },
  {
    id: '6ab9c99e-8942-4236-ad6e-7e38c51da810',
    tabs: [
      {
        favIconUrl: 'https://getfedora.org/static/images/favicon.ico',
        id: 218,
        title: 'Fedora',
        url: 'https://getfedora.org/',
      },
      {
        favIconUrl: 'https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png',
        id: 220,
        title: 'Enterprise Open Source and Linux | Ubuntu',
        url: 'https://ubuntu.com/',
      },
      {
        favIconUrl: 'https://c.s-microsoft.com/favicon.ico?v2',
        id: 222,
        title: 'Microsoft – Cloud, Computers, Apps & Gaming',
        url: 'https://www.microsoft.com/en-us/',
      },
      {
        favIconUrl: 'https://www.google.com/favicon.ico',
        id: 224,
        title: 'Google',
        url: 'https://www.google.com/',
      },
    ],
    timestamp: 1650847781791,
  },
];

export const getTabGroupsMock = () => cloneDeep(tabGroupsMock);
