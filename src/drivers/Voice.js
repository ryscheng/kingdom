"use strict";
const say = require("say");

var DEFAULT_VOICE;
if (process.platform === "darwin") {
  DEFAULT_VOICE = "Alex";
} else {
  // say uses Festival for Linux
  DEFAULT_VOICE = null;
}

class Voice {
  constructor(voiceName) {
    this._voiceName = voiceName;
    if (typeof voiceName === "undefined") {
      this._voiceName = DEFAULT_VOICE;
    }
  }

  say(phrase) {
    return new Promise(function(phrase, resolve, reject) {
      say.speak(this._voiceName, phrase, function(resolve, reject) {
        resolve();
      }.bind(this, resolve, reject));
    }.bind(this, phrase));
  }
}

module.exports = Voice;
