window.matchMedia = function () {
  return {};
};

chrome = {
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
      set: (config) => new Promise((resolve) => resolve(config)),
      get: (key) => new Promise((resolve) => resolve(key)),
      remove(key) {},
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
  },
};
