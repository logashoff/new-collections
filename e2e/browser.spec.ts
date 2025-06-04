import path from 'path';
import { Browser, launch, Page } from 'puppeteer';
import { mockStorageArea } from 'src/mocks';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const EXTENSION_ID = 'epapmilbbjgnlheogbhblbnnbmbjoadd';
const EXTENSION_BASE_URL = `chrome-extension://${EXTENSION_ID}/index.html#`;
const EXTENSION_PATH = path.join(process.cwd(), 'dist/new-collections');
const NEW_TAB_MAIN_PAGE = '/new-tab/main';

describe('Browser', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch({
      headless: true,
      pipe: true,
      enableExtensions: true,
    });

    await browser.installExtension(EXTENSION_PATH);

    page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720,
    });

    await page.goto(`${EXTENSION_BASE_URL}/${NEW_TAB_MAIN_PAGE}`, { waitUntil: 'networkidle0' });
  });

  afterAll(async () => {
    await browser.uninstallExtension(EXTENSION_ID);
    await browser.close();
    browser = undefined;
  });

  test('check blank page content', async () => {
    const blankMessage = await page
      .locator('.message')
      .map((el) => el.textContent)
      .wait();

    expect(blankMessage).toEqual(
      'Import collections from previously saved file or use Add Collection button to save open tabs'
    );

    const actionBtn = await page.locator('.actions .mdc-fab');
    expect(actionBtn).toBeTruthy();
  });

  test('check stored tabs list', async () => {
    await page.evaluate(`chrome.storage.sync.set(${JSON.stringify(mockStorageArea)})`);

    const timelineEl = await page.$$('nc-timeline-element');
    expect(timelineEl.length).toBe(2);

    let tabGroups = await page.$$('nc-groups .mat-expansion-panel');
    expect(tabGroups.length).toBe(3);

    tabGroups = await page.$$('nc-groups .mat-expansion-panel-header');
    for (const [, el] of tabGroups.entries()) {
      await el.click();
    }

    const tabEl = await page.$$('nc-list-item');
    expect(tabEl.length).toBe(14);
  });

  test('edit existing tabs', async () => {
    await page.locator('nc-list-item').hover();
    await page.locator('nc-list-item .controls .mat-mdc-icon-button').click();

    const nameInput = await page.waitForSelector('nc-rename-dialog .mat-mdc-input-element');
    await nameInput.click({ count: 3 });
    await nameInput.press('Backspace');
    await nameInput.type('Test title');

    const submitButton = await page.waitForSelector(
      'nc-rename-dialog .mat-mdc-dialog-actions .mdc-button[type="submit"]'
    );

    expect(submitButton).toBeTruthy();

    await submitButton.click({ delay: 1000 });

    const newTitle = await page
      .locator('nc-list-item .title')
      .map((el) => el.textContent)
      .wait();

    expect(newTitle).toBe('Test title');
  });

  test.todo('restore tabs and check tab selector grouped tabs');
  test.todo('test search input results');
  test.todo('delete items');
});
