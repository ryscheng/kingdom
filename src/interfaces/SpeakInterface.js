"use strict";

const EventEmitter = require("events");

class SpeakInterface extends EventEmitter {
  constructor(voice) {
    super();
    this._voice = voice;
  }

  startListening() {
    //@todo complete
  }

  respond(response) {
    this._voice.say(response);
  }
}

module.exports = SpeakInterface;
