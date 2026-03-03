import { cloneDeep } from 'lodash-es';
import { Tab, Tabs } from 'src/app/utils';

export class MockStorageArea implements Partial<chrome.storage.StorageArea> {
  #storage = {};

  MAX_ITEMS = 0;
  readonly  MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE = 1000000;
  MAX_WRITE_OPERATIONS_PER_HOUR = 0;
  MAX_WRITE_OPERATIONS_PER_MINUTE = 0;
  readonly QUOTA_BYTES: 10485760 | 102400 = 10485760;
  QUOTA_BYTES_PER_ITEM = 0;

  onChanged: chrome.storage.StorageArea['onChanged']
  accessLevel: chrome.storage.AccessLevel;

  constructor(storage = {}) {
    this.#storage = cloneDeep(storage);
  }

  async set(config) {
    this.#storage = {
      ...cloneDeep(config),
    };
  }

  async get(key) {
    if (key) {
      return this.#storage[key] ?? {};
    }

    return this.#storage;
  }

  async remove(keys) {
    if (Array.isArray(keys)) {
      keys.forEach((key) => delete this.#storage[key]);
    } else {
      delete this.#storage[keys];
    }
  }

  async clear() {
    this.#storage = {};
  }

  async getKeys() {
    return Object.keys(this.#storage);
  }

  async getBytesInUse(keys?: unknown): Promise<0> {
    if (!keys) {
      return 0;
    }
  }

  async setAccessLevel(accessOptions: { accessLevel: chrome.storage.AccessLevel }): Promise<void> {
    if (accessOptions) {
      this.accessLevel = accessOptions.accessLevel;
    }
  }
}

export const getBrowserApi = (browserTabs: Tabs = [], storage = new MockStorageArea()): Partial<typeof chrome> => ({
  runtime: {
    openOptionsPage: async () => {},
    connect: () => ({
      onDisconnect: {
        addListener: (callback) => callback(),
      },
    }),
    getURL: (path) => path,
  } as Partial<typeof chrome.runtime>,
  storage: {
    AccessLevel: {
      TRUSTED_AND_UNTRUSTED_CONTEXTS: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
      TRUSTED_CONTEXTS: 'TRUSTED_CONTEXTS',
    },
    session: storage,
    managed: storage,
    local: storage,
    sync: storage,
    onChanged: {
      addRules() {},
      getRules() {},
      hasListener: () => false,
      hasListeners: () => false,
      removeListener() {},
      removeRules() {},
      addListener(callback) {
        callback(storage?.['recent'] ?? {}, 'sync');
      },
    },
  } as Partial<typeof chrome.storage>,
  tabs: {
    query: async () => browserTabs,
    create: async (config): Promise<Tab> => ({
      active: false,
      autoDiscardable: false,
      discarded: false,
      frozen: false,
      groupId: -1,
      highlighted: false,
      incognito: false,
      index: 0,
      pinned: false,
      windowId: 0,
      ...config,
    }),
    group: async () => (Math.random() * 1_000) >> 0,
  } as Partial<typeof chrome.tabs>,
  tabGroups: {
    update: async (groupId, updateProperties) => ({ groupId, ...updateProperties }),
  } as Partial<typeof chrome.tabGroups>,
  i18n: {
    getMessage(messageName) {
      return messageName;
    },
  } as Partial<typeof chrome.i18n>,
});
