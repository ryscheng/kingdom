"use strict";

const EventEmitter = require("events");
const config = require("config");

const TIMEOUT = 5000;
const RESPONSE_MSG = "how can I help you?";

class SpeakInterface extends EventEmitter {
  constructor(speechIn, audioOut) {
    super();
    this._keyphrases = config.get("app.keyphrases");
    this._speechIn = speechIn
    this._audioOut = audioOut;
    this._readyForCmd = false;
    this._speechIn.on("command", this._onCommand.bind(this));
  }

  _reset() {
    this._readyForCmd = false;
    console.log("EARMUFFS");
  }

  _onCommand(command) {
    console.log(command);
    if (command.score > -6000) {
      if (this._keyphrases.indexOf(command.line) > -1) {
        this._readyForCmd = true;
        this._audioOut.say(RESPONSE_MSG);
        console.log("Waiting for command");
        setTimeout(this._reset.bind(this), TIMEOUT);
      } else {
        if (this._readyForCmd === true) {
          this.emit("command", command.line);
          console.log("... emitted");
          this._reset();
        }
      }
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
