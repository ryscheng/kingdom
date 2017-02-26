"use strict";

const EventEmitter = require("events");
const config = require("config");
const winston = require("winston");

const TIMEOUT = 10000;
const THRESHOLD = -6000;
const PERIODIC_INTERVAL = 60000;
//const RESPONSE_MSG = "how can I help you?";

class SpeakInterface extends EventEmitter {
  constructor(speechIn, audioOut, lights) {
    super();
    // Private variables
    this.log = winston.loggers.get("interfaces");
    this._keyphrases = config.get("app.keyphrases");
    this._speechIn = speechIn;
    this._audioOut = audioOut;
    this._lights = lights;
    this._readyUntil = Date.now();
    this._periodicId = null;
    this._audioOn = false;
    // Event handlers
    this._periodicId = setInterval(this._periodic.bind(this), PERIODIC_INTERVAL);
    this._audioOut.on("audio", this._onAudioChange.bind(this));
    this._speechIn.on("command", this._onCommand.bind(this));
    this.log.info("SpeakInterface initialized");
  }

  /********************************
   * PUBLIC METHODS
   ********************************/

  startListening() {
    //@todo complete
  }

  respond(response) {
    return this._audioOut.say(response);
  }

  /********************************
   * PRIVATE METHODS
   ********************************/

  _periodic() {
    this.log.info("SpeakInterface periodic function running...");
    // Only restart if the audio isn't playing
    if (!this._audioOn) {
      this._speechIn.restart();
    }
  }

  _onAudioChange(audio) {
    this.log.info("SpeakInterface sees that audio:" + audio);
    this._audioOn = audio;
    if (audio === true && this._speechIn.isRunning()) {
      this._speechIn.stop();
    } else if (audio === false && !this._speechIn.isRunning()) {
      this._speechIn.start();
    }
  }

  _indicateReady() {
    this.log.info("SpeakInterface: Waiting for command");
    //this._audioOut.say(RESPONSE_MSG);
    if (this._lights !== null && typeof this._lights !== "undefined") {
      // @TODO some other kind of indicator
      //this._lights.blink();
    }
  }

  _onCommand(command) {
    this.log.debug(JSON.stringify(command));
    if (command.score > THRESHOLD) {
      if (this._keyphrases.indexOf(command.line) > -1) {
        this._readyUntil = Date.now() + TIMEOUT;
        this._indicateReady();
      } else {
        if ((this._readyUntil - Date.now()) > 0) {
          this.log.verbose("... emitted");
          //this._readyUntil = Date.now() + TIMEOUT;
          this._readyUntil = Date.now(); // Only listen for 1 command at a time
          this.emit("command", command.line);
        } else {
          this.log.verbose("Not currently listening for commands");
        }
      }
    }
  }


}

module.exports = SpeakInterface;
