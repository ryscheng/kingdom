"use strict";

const EventEmitter = require("events");
const config = require("config");
const winston = require("winston");

const TIMEOUT = 10000;
const SCORE_THRESHOLD = -6000;
const RESTART_THRESHOLD = 5;
const PERIODIC_INTERVAL = 600000; // 10 min
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
    this._poorScoreCount = 0;
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

  _resetPocketsphinx() {
    this._poorScoreCount = 0;
    this._speechIn.restart();
  }

  _periodic() {
    this.log.info("SpeakInterface periodic function running...");

    // if music is playing, stop the speech recognition
    if (this._speechIn.isRunning() && this._audioOut.isPlaying()) {
      this.log.info("Stopping SpeechIn, music playing");
      this._speechIn.stop();
    // if the music is off, start the speech recognition
    } else if (!this._speechIn.isRunning() && !this._audioOut.isPlaying()) {
      this.log.info("Starting SpeechIn, no music");
      this._resetPocketsphinx();
    // if we haven't seen good scores in a while
    } else if (this._speechIn.isRunning() && this._poorScoreCount > RESTART_THRESHOLD) {
      this.log.info("Restarting SpeechIn, haven't seen a good recognition in " + this._poorScoreCount + " tries");
      this._resetPocketsphinx();
    }

  }

  _onAudioChange(audio) {
    this.log.info("SpeakInterface sees that audio:" + audio);
    this._audioOn = audio;
    this._periodic();
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
    if (command.score > SCORE_THRESHOLD) {
      this._poorScoreCount = 0;
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
    } else {
      this._poorScoreCount++;
    }
  }


}

module.exports = SpeakInterface;
