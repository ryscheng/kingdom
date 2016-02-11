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
    return this._voice.say(response);
  }
}

module.exports = SpeakInterface;
