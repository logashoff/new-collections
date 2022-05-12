import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { browserTabsMock, tabGroupsMock } from 'src/mocks';
import { ignoreUrlsRegExp } from '../utils/models';
import { getHostname } from '../utils/tab';
import { TabService } from './tab.service';

jest.mock('src/app/utils', () => ({
  getSavedTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(tabGroupsMock.concat()))),
  queryTabs: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(browserTabsMock.concat()))),
  queryCurrentWindow: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(browserTabsMock.concat()))),
  removeTab: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  saveTabGroups: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(0))),
  ignoreUrlsRegExp,
  getHostname,
}));

describe('TabService', () => {
  let spectator: SpectatorService<TabService>;
  const createService = createServiceFactory({
    service: TabService,
    imports: [MatSnackBarModule],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should initialize tabs', () => {
    const tabGroups = spectator.service['tabGroups'];

    expect(tabGroups.length).toBe(3);
    expect(tabGroups[0].tabs.length).toBe(5);
    expect(tabGroups[1].tabs.length).toBe(2);
    expect(tabGroups[2].tabs.length).toBe(4);
  });

  it('should generate tab group', async () => {
    const tabGroup = await spectator.service.createTabGroup(browserTabsMock);

    expect(tabGroup.tabs.length).toBe(3);
  });

  it('should save tab group', async () => {
    const tabGroup = await spectator.service.createTabGroup(browserTabsMock);
    await spectator.service.saveTabGroup(tabGroup);

    const tabGroups = spectator.service['tabGroupsSource$'].value;

    expect(tabGroups.length).toBe(4);
    expect(tabGroups[0].tabs.length).toBe(3);

    const [tab1, tab2, tab3] = tabGroups[0].tabs;

    expect(tab1.id).toBe(48);
    expect(tab1.title).toBe('GitLab - The One DevOps Platform');
    expect(tab1.url).toBe('https://about.gitlab.com/');

    expect(tab2.id).toBe(49);
    expect(tab2.title).toBe('GitHub: Where the world builds software · GitHub');
    expect(tab2.url).toBe('https://github.com/');

    expect(tab3.id).toBe(50);
    expect(tab3.title).toBe('Fedora');
    expect(tab3.url).toBe('https://getfedora.org/');
  });

  it('should generate icon groups', () => {
    const tabGroups = spectator.service['tabGroups'];

    expect(tabGroups.length).toBe(3);

    expect(spectator.service.getTabsGroupedByHostname(tabGroups[0]).length).toBe(4);
    expect(spectator.service.getTabsGroupedByHostname(tabGroups[1]).length).toBe(2);
    expect(spectator.service.getTabsGroupedByHostname(tabGroups[2]).length).toBe(4);
  });

  it('should update tab and icon groups list when tab is removed', () => {
    const [group1] = spectator.service['tabGroups'];
    const [tab1, tab2, tab3] = group1.tabs;

    expect(spectator.service.getTabsGroupedByHostname(group1).length).toBe(4);

    spectator.service.removeTab(tab1);
    expect(spectator.service.getTabsGroupedByHostname(group1).length).toBe(4);
    expect(group1.tabs.length).toBe(4);

    spectator.service.removeTab(tab2);
    expect(spectator.service.getTabsGroupedByHostname(group1).length).toBe(3);
    expect(group1.tabs.length).toBe(3);

    spectator.service.removeTab(tab3);
    expect(spectator.service.getTabsGroupedByHostname(group1).length).toBe(2);
    expect(group1.tabs.length).toBe(2);
  });
});
