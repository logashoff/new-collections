import { cpus } from 'node:os';

const DEFAULT_CONFIG = {
  browserContext: 'default',
  exitOnPageError: true,
};

const getWorkersCount = (viConfig) => {
  if (viConfig.maxWorkers != null) {
    return Number(viConfig.maxWorkers);
  }

  if (viConfig.watch) {
    return 1;
  }

  return cpus().length - 1;
};

const openBrowser = async (config) => {
  const puppeteer = await import('puppeteer');

  if (config.connect) {
    return puppeteer.connect(config.connect);
  }

  return puppeteer.launch(config.launch);
};

const closeBrowser = async (config, browser) => {
  if (config.connect) {
    return browser.disconnect();
  }

  return browser.close();
};

const saveWorkersCount = (workersCount) => {
  process.env.WORKERS_COUNT = workersCount.toString();
};

const saveWsEndpoints = (wsEndpoints) => {
  process.env.PUPPETEER_WS_ENDPOINTS = JSON.stringify(wsEndpoints);
};

const startBrowsers = async ({ config, viConfig }) => {
  const workersCount = getWorkersCount(viConfig);

  saveWorkersCount(workersCount);

  if (config.connect?.browserWSEndpoint) {
    if (workersCount > 1) {
      throw new Error('Cannot use `connect.browserWSEndpoint` with multiple workers.');
    }

    saveWsEndpoints([config.connect.browserWSEndpoint]);

    return [];
  }

  const browsers = await Promise.all(
    Array.from({
      length: workersCount,
    }).map(() => openBrowser(config))
  );

  const wsEndpoints = browsers.map((browser) => browser.wsEndpoint());
  saveWsEndpoints(wsEndpoints);

  return browsers;
};

const closeBrowsers = async (config, browsers) => {
  await Promise.all(browsers.map(async (browser) => closeBrowser(config, browser)));
};

const getDefaultConfig = () => {
  if (process.env.CI) {
    return {
      ...DEFAULT_CONFIG,
      launch: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
      },
    };
  }

  return DEFAULT_CONFIG;
};

const setup = async ({ config: viConfig }) => {
  globalThis.__ctxPtr = globalThis.__ctxPtr ?? {};
  const ctx = globalThis.__ctxPtr;

  const config = await getDefaultConfig();
  ctx.config = config;

  ctx.browsers = await startBrowsers({
    config,
    viConfig,
  });
};

const teardown = async () => {
  const ctx = globalThis.__ctxPtr;

  if (!ctx || !ctx.config) {
    return;
  }

  if (ctx.browsers) {
    await closeBrowsers(ctx.config, ctx.browsers);
    delete ctx.browsers;
  }
};

export { setup, teardown };
