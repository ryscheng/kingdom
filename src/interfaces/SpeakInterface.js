"use strict";

const EventEmitter = require("events");

class SpeakInterface extends EventEmitter {
  constructor(speechIn, audioOut) {
    super();
    this._speechIn = speechIn
    this._audioOut = audioOut;
    this._speechIn.on("command", this._onCommand.bind(this));
  }

  _onCommand(command) {
    console.log(command);
    if (command.score > -6000) {
      this.emit("command", command.line);
      console.log("... emitted");
    }
  }

  startListening() {
    //@todo complete
  }

  respond(response) {
    return this._audioOut.say(response);
  }
}

module.exports = SpeakInterface;
