"use strict";


class Assistant {
  constructor() {
    this._plugins = [];
  }

  addPlugin(plugin) {
    this._plugins.push(plugin);
  }

  command(phrase) {
  }
}

module.exports = Assistant;
