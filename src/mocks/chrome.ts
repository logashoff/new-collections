import { cloneDeep } from 'lodash-es';
import { Tab, Tabs } from 'src/app/utils';

export class MockStorageArea implements Partial<chrome.storage.StorageArea> {
  #storage = {};

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
}

export const getBrowserApi = (browserTabs: Tabs = [], storage = new MockStorageArea()) => ({
  runtime: {
    openOptionsPage: () => {},
    connect: () => ({
      onDisconnect: {
        addListener: (callback) => callback(),
      },
    }),
    getURL: (path) => path,
  },
  storage: {
    local: storage,
    sync: storage,
    onChanged: {
      addListener(callback) {
        callback({});
      },
    },
  },
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
      selected: false,
      windowId: 0,
      ...config,
    }),
    group: async () => (Math.random() * 1_000) >> 0,
  },
  tabGroups: {
    update() {},
  },
  i18n: {
    getMessage(messageName) {
      return messageName;
    },
  },
});
