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
      set: function (config, callback) {
        callback();
      },
      get: function (key, callback) {
        callback({});
      },
    },
    sync: {
      set: function (config, callback) {
        if (callback) {
          callback();
        }
      },
      get: function (key, callback) {
        callback({});
      },
      remove: function (key) {},
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
