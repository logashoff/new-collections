import { of } from 'rxjs';
import { getTabGroupMock } from './collections';
import { getBrowserTabsMock } from './tabs';

export class TabServiceMock {
  readonly addTabGroup = () => new Promise((resolve) => resolve(0));
  readonly createTabGroup = () => new Promise((resolve) => resolve(getTabGroupMock()));
  readonly openTabsSelector = () => ({
    afterClosed: () => of(getBrowserTabsMock()),
  });

  addTabGroups() {}
}
