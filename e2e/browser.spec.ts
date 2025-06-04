import path from 'path';
import { Browser, launch, Page } from 'puppeteer';
import { mockStorageArea } from 'src/mocks';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const EXTENSION_ID = 'epapmilbbjgnlheogbhblbnnbmbjoadd';
const EXTENSION_BASE_URL = `chrome-extension://${EXTENSION_ID}/index.html#`;
const EXTENSION_PATH = path.join(process.cwd(), 'dist/new-collections');
const NEW_TAB_MAIN_PAGE = '/new-tab/main';
const NEW_TAB_SEARCH_PAGE = '/new-tab/search';

describe('Browser', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch({
      pipe: true,
      enableExtensions: true,
    });

    await browser.installExtension(EXTENSION_PATH);

    page = await browser.newPage();

    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
    });

    await page.goto(`${EXTENSION_BASE_URL}/${NEW_TAB_MAIN_PAGE}`, { waitUntil: 'networkidle0' });
  });

  afterAll(() => {
    browser.close();
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

    tabGroups = await page.$$('nc-groups .mat-expansion-panel:not(.mat-expanded)');
    for (let [i, el] of tabGroups.entries()) {
      await el.scrollIntoView();
      await el.focus();
      await el.click();
    }

    const tabEl = await page.$$('nc-list-item');
    expect(tabEl.length).toBe(14);
  });

  test.todo('edit existing tabs');
  test.todo('restore tabs and check tab selector grouped tabs');
  test.todo('test search input results');
  test.todo('delete items');
});
