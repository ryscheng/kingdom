"use strict";
const say = require("say");
const lame = require("lame");
const Volume = require("pcm-volume");
const Speaker = require("speaker");

var DEFAULT_VOICE;
if (process.platform === "darwin") {
  DEFAULT_VOICE = "Alex";
} else {
  // say uses Festival for Linux
  DEFAULT_VOICE = null;
}

class AudioOut {
  constructor(voiceName) {
    this._voiceName = voiceName;
    if (typeof voiceName === "undefined") {
      this._voiceName = DEFAULT_VOICE;
    }

    this._songQueue = [];
    this._currentSong = null;
  }

  say(phrase) {
    return new Promise(function(phrase, resolve, reject) {
      say.speak(this._voiceName, phrase, function(resolve, reject) {
        resolve();
      }.bind(this, resolve, reject));
    }.bind(this, phrase));
  }

  getSongQueue() {
    return this._songQueue;
  }

  clearSongQueue() {
    this._songQueue = [];
  }

  queueSong(song) {
    this._songQueue.push(song);
  }

  playSong() {
  }

}

module.exports = AudioOut;
