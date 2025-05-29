import { of } from 'rxjs';
import { getTabGroupMock } from './collections';
import { getBrowserTabsMock } from './tabs';

export class TabServiceMock {
  readonly addTabGroup = async () => 0;
  readonly createTabGroup = async () => getTabGroupMock();
  readonly openTabsSelector = () => ({
    afterClosed: () => of(getBrowserTabsMock()),
  });

  addTabGroups() {}
}
