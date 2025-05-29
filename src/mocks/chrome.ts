export const chrome = {
  action: {},
  runtime: {
    openOptionsPage: function () {},
  },
  storage: {
    local: {
      set: (config) => new Promise((resolve) => resolve(config)),
      get: (key) => new Promise((resolve) => resolve(key)),
    },
    sync: {
      set: (config) => new Promise<void>((resolve) => resolve(config)),
      get: (key) => new Promise<void>((resolve) => resolve(key)),
      remove: (key) => new Promise<void>((resolve) => resolve(key)),
    },
    onChanged: {
      addListener: function (callback) {
        callback({});
      },
    },
  },
  tabs: {
    query: function (config, callback) {
      callback();
    },
    remove: function (tabId, callback) {
      callback();
    },
    create: function () {},
    onCreated: {
      addListener: function () {},
    },
    onRemoved: {
      addListener: function () {},
    },
    onUpdated: {
      addListener: function () {},
    },
  },
  i18n: {
    getMessage(messageName) {
      return messageName;
    },
  },
};
