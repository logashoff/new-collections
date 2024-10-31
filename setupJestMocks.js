window.matchMedia = function () {
  return {};
};

window.crypto = {
  getRandomValues: function () {
    return new Uint32Array([
      1929376539, 414301398, 3127221437, 2083965327, 2898567419, 3577273313, 1228040162, 1726248346, 1430000282,
      1053009359,
    ]);
  },
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
