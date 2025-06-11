import { Browser, launch, LaunchOptions, Page } from 'puppeteer';
import { mockStorageArea } from 'src/mocks';
import { afterAll, beforeAll, expect, suite, test } from 'vitest';

const EXTENSION_PATH = './dist/new-collections';
const NEW_TAB_MAIN_PAGE = 'new-tab/main';

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
      args: ['--no-sandbox'],
      slowMo: 25,
    };

    browser = await launch(launchOptions);

    extensionId = await browser.installExtension(EXTENSION_PATH);
    extensionBaseUrl = `chrome-extension://${extensionId}/index.html#`;

    page = await browser.newPage();

    await page.goto(`${extensionBaseUrl}/${NEW_TAB_MAIN_PAGE}`, { waitUntil: 'networkidle0' });
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

    await page.waitForNetworkIdle();

    const addCollectionsButton = await page.$('[data-testid=add-collections]');
    await addCollectionsButton.click();

    await page.waitForNetworkIdle();

    const tabGroupsSelector = await page.$$('[data-testid=tab-selector-list] .tab-group');
    expect(tabGroupsSelector?.length).toBeGreaterThan(0);
    expect(tabGroupsSelector?.length).toBe(4);

    const selectAll = await page.$('[data-testid=tab-selector-select-all]');
    await selectAll.click();

    const submitButton = await page.$('[data-testid=tab-selector-submit]');
    await submitButton.click();
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

  test.todo('delete items');
});
