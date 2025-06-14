import { Browser, launch, LaunchOptions, Page } from 'puppeteer';
import { mockStorageArea } from 'src/mocks';
import { afterAll, beforeAll, expect, suite, test } from 'vitest';

const EXTENSION_PATH = './dist/new-collections';
const NEW_TAB_MAIN_PAGE = 'new-tab/main';
const OPTIONS_PAGE = 'options';

suite.sequential('Browser', () => {
  let browser: Browser;
  let page: Page;
  let extensionId: string;
  let extensionBaseUrl: string;

  beforeAll(async () => {
    const launchOptions: LaunchOptions = {
      headless: true,
      pipe: true,
      enableExtensions: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      devtools: false,
      args: ['--no-sandbox'],
      slowMo: 25,
    };

    browser = await launch(launchOptions);

    extensionId = await browser.installExtension(EXTENSION_PATH);
    extensionBaseUrl = `chrome-extension://${extensionId}/index.html#`;

    page = await browser.newPage();

    await page.goto(`${extensionBaseUrl}/${NEW_TAB_MAIN_PAGE}`, { waitUntil: 'networkidle0' });
    await page.evaluate(
      `chrome.storage.local.set(${JSON.stringify({
        settings: {
          enableDevices: true,
          enableTopSites: true,
          syncStorage: true,
        },
      })})`
    );
  });

  afterAll(async () => {
    await browser.uninstallExtension(extensionId);
    await browser.close();
    browser = undefined;
  });

  test('check blank page content', async () => {
    const blankMessage = await page
      .locator('[data-testid=empty-message-text]')
      .map((el) => el.textContent)
      .wait();

    expect(blankMessage).toEqual(
      'Import collections from previously saved file or use Add Collection button to save open tabs'
    );

    const actionBtn = await page.locator('[data-testid="empty-action-import-collections"]').wait();
    expect(actionBtn).toBeTruthy();
  });

  test('check stored tabs list', async () => {
    await page.evaluate(`chrome.storage.sync.set(${JSON.stringify(mockStorageArea)})`);

    const timelineEl = await page.$$('nc-timeline-element');
    expect(timelineEl.length).toBe(2);

    const tabGroups = await page.$$('nc-groups .mat-expansion-panel');
    expect(tabGroups.length).toBe(3);

    const firstGroupHeader = await page.$('[data-testid=timeline-element-0] [data-testid=group-header-0]');
    await firstGroupHeader.click();

    await page.waitForNetworkIdle();

    const tabEl = await page.$$('[data-testid=timeline-element-0] [data-testid=group-panel-0] nc-list-item');
    expect(tabEl.length).toBe(4);
  });

  test('edit existing tabs', async () => {
    const firstListItem = await page.$('[data-testid=group-panel-0] [data-testid=list-item-0]');

    expect(firstListItem).toBeTruthy();

    const editButton = await firstListItem.$('[data-testid=list-item-action-edit]');

    await firstListItem.hover();
    await editButton.click();

    await page.waitForNetworkIdle();

    const nameInput = await page.waitForSelector('[data-testid=rename-dialog-name-input]');
    await nameInput.click({ count: 3 });
    await nameInput.press('Backspace');
    await nameInput.type('Test title');

    const submitButton = await page.waitForSelector('[data-testid=rename-dialog-submit-button]');

    expect(submitButton).toBeTruthy();

    await submitButton.click({ delay: 1000 });

    const newTitle = await page
      .locator('[data-testid=timeline-element-0] [data-testid=group-panel-0] [data-testid=list-item-0] .title')
      .map((el) => el.textContent)
      .wait();

    expect(newTitle).toBe('Test title');
  });

  test('restore tabs and check tab selector grouped tabs', async () => {
    const restoreGroupButton = await page.$('[data-testid=group-panel-0] [data-testid=group-action-restore]');
    await restoreGroupButton.click();

    let pages = await browser.pages();
    for (const [, page] of pages.entries()) {
      await page.waitForNetworkIdle();
    }

    await page.waitForNetworkIdle();

    const addCollectionsButton = await page.$('[data-testid=add-collections]');
    await addCollectionsButton.click();

    await page.waitForNetworkIdle();

    const tabGroupsSelector = await page.$$('[data-testid=tab-selector-list] .tab-group');
    expect(tabGroupsSelector.length).toBeGreaterThan(0);
    expect(tabGroupsSelector.length).toBe(4);

    const selectAll = await page.$('[data-testid=tab-selector-select-all]');
    await selectAll.click();

    const submitButton = await page.$('[data-testid=tab-selector-submit]');
    await submitButton.click();

    await page.waitForNetworkIdle();

    const tabGroups = await page.$$('nc-timeline-element');
    expect(tabGroups.length).toBe(3);

    pages = await browser.pages();
    for (const [, p] of pages.entries()) {
      if (p !== page) {
        await p.close();
      }
    }
  });

  test('test search input results', async () => {
    const searchInput = await page.$('[data-testid=search-input]');

    await searchInput.focus();
    await searchInput.click();

    await page.waitForNetworkIdle();

    let recentList = await page.$$('nc-list-item');
    expect(recentList.length).toBe(15);

    await searchInput.type('test title');

    await page.waitForNetworkIdle();

    recentList = await page.$$('nc-list-item');
    expect(recentList.length).toBe(1);

    const resultsLabel = await page
      .locator('nc-timeline-label')
      .map((el) => el.textContent.trim())
      .wait();

    expect(resultsLabel).toEqual('One result');

    await searchInput.click({ count: 3 });
    await searchInput.press('Backspace');
    await searchInput.type('noop');

    await page.waitForNetworkIdle();

    const noResultsMessage = await page
      .locator('[data-testid=empty-message-text]')
      .map((el) => el.textContent.trim())
      .wait();

    await page.waitForNetworkIdle();

    expect(noResultsMessage).toEqual('Nothing found for ‘noop’');

    const cancelButton = await page.$('[data-testid=cancel-search]');
    await cancelButton.click();
  });

  test('delete items', async () => {
    const groupHeader = await page.$('[data-testid=timeline-element-0] [data-testid=group-header-0]');
    await groupHeader.click();

    await page.waitForNetworkIdle();

    for (let i = 0; i < 2; i++) {
      const timeline = await page.$('[data-testid=timeline-element-0]');
      const listItem = await timeline.$('[data-testid=list-item-0]');
      expect(listItem).toBeTruthy();
      const removeButton = await listItem.$('[data-testid=list-item-action-remove]');
      await listItem.hover();
      await removeButton.click();
      const listItems = await timeline.$$('nc-list-item');
      expect(listItems.length).toBe(3 - i);
    }

    const removeAll = await page.$('[data-testid=timeline-element-0] [data-testid=remove-all]');
    await removeAll.click();

    const timelines = await page.$$('nc-timeline-element');
    expect(timelines.length).toBe(2);

    const panels = await page.$$('.mat-expansion-panel');
    expect(panels.length).toBe(3);
  });

  test('toggle options', async () => {
    const optionsPage = `${extensionBaseUrl}/${OPTIONS_PAGE}`;
    await page.goto(optionsPage, { waitUntil: 'networkidle0' });

    let option = await page.$('[data-testid=settings-toggle-sync]');
    await option.click();
    await page.goBack();
    await page.reload({ waitUntil: 'networkidle0' });
    let timelines = await page.$$('nc-timeline-element');
    expect(timelines.length).toBe(2);

    await page.goto(optionsPage, { waitUntil: 'networkidle0' });
    option = await page.$('[data-testid=settings-toggle-devices]');
    await option.click();
    await page.goBack();
    await page.reload({ waitUntil: 'networkidle0' });
    timelines = await page.$$('nc-timeline-element');
    expect(timelines.length).toBe(2);

    await page.goto(optionsPage, { waitUntil: 'networkidle0' });
    option = await page.$('[data-testid=settings-toggle-sites]');
    await option.click();
    await page.goBack();
    await page.reload({ waitUntil: 'networkidle0' });
    timelines = await page.$$('nc-timeline-element');
    expect(timelines.length).toBe(2);

    await page.goto(optionsPage, { waitUntil: 'networkidle0' });
    option = await page.$('[data-testid=settings-toggle-sync]');
    await option.click();
    option = await page.$('[data-testid=settings-toggle-devices]');
    await option.click();
    option = await page.$('[data-testid=settings-toggle-sites]');
    await option.click();
    await page.goBack();
    await page.reload({ waitUntil: 'networkidle0' });
    timelines = await page.$$('nc-timeline-element');
    expect(timelines.length).toBe(2);
  });
});
