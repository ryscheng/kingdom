"use strict";

const EventEmitter = require("events");
const config = require("config");
const winston = require("winston");

const TIMEOUT = 10000;
const THRESHOLD = -6000;
//const RESPONSE_MSG = "how can I help you?";

class SpeakInterface extends EventEmitter {
  constructor(speechIn, audioOut) {
    super();
    this.log = winston.loggers.get("interfaces");
    this._keyphrases = config.get("app.keyphrases");
    this._speechIn = speechIn;
    this._audioOut = audioOut;
    this._readyUntil = Date.now();
    this._speechIn.on("command", this._onCommand.bind(this));
    this.log.info("SpeakInterface initialized");
  }

  _onCommand(command) {
    this.log.debug(JSON.stringify(command));
    if (command.score > THRESHOLD) {
      if (this._keyphrases.indexOf(command.line) > -1) {
        this._readyUntil = Date.now() + TIMEOUT;
        this.log.info("Waiting for command");
        //this._audioOut.say(RESPONSE_MSG);
        //setTimeout(this._reset.bind(this), TIMEOUT);
      } else {
        if ((this._readyUntil - Date.now()) > 0) {
          this.log.verbose("... emitted");
          this._readyUntil = Date.now() + TIMEOUT;
          this.emit("command", command.line);
        } else {
          this.log.verbose("Not currently listening for commands");
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
