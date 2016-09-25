"use strict";

const EventEmitter = require("events");

class SpeakInterface extends EventEmitter {
  constructor(speechIn, audioOut) {
    super();
    this._speechIn = speechIn
    this._audioOut = audioOut;
  }

  startListening() {
    //@todo complete
  }

  respond(response) {
    return this._audioOut.say(response);
  }
}

module.exports = SpeakInterface;
