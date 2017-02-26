"use strict";

const winston = require("winston");
const ChildProcess = require("child_process");
const EventEmitter = require("events");

const RESTART_DELAY = 100;  // milliseconds
const SCORE_SELECTOR = "Bestpath score";
const NORMALIZER_SELECTOR = "Normalizer P(O)";
const JOINT_SELECTOR = "Joint P(O,S)";

/**
 * Class representing the SpeechIn driver
 * SpeechIn interacts with pocketsphinx for speech recognition
 *  and the mic for general audio processing
 *
 * Events:
 * - 'command': {
 *     "line": String,  // recognized words
 *     "score": Number, // confidence score
 *     "normalizer": Number,
 *     "joint": Number,
 *   }
 **/
class SpeechIn extends EventEmitter {

  /**
   * Create a SpeechIn driver
   * @param {Object.<string, string>} pocketsphinxOpts - configuration to find/run pocketsphinx_continuous
   **/
  constructor(pocketsphinxOpts) {
    super();
    // Private variables
    this.log = winston.loggers.get("drivers");
    this._pocketsphinxOpts = pocketsphinxOpts;
    this._current = {};   // Current command to emit
    this._process = null;

    this._resetCurrent();
    // For some reason, child processes aren't automatically killed on Mac OS X
    process.on("exit", () => {
      if (this._process !== null) {
        this._process.kill();
      }
    });
    this.log.info("SpeechIn driver initialized");
  }

  /********************************
   * PUBLIC METHODS
   ********************************/

  /**
   * Checks if the driver is started
   **/
  isRunning() {
    return this._process !== null;
  }

  /**
   * Start the driver.
   * Starts a pocketsphinx_continuous process
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("SpeechIn.start()");
    if (this.isRunning()) {
      this.log.verbose("SpeechIn already runnning");
      return Promise.resolve();
    }
    this._process = ChildProcess.spawn(this._pocketsphinxOpts.bin, [
      "-hmm", this._pocketsphinxOpts.hmm,
      "-lm", this._pocketsphinxOpts.lm,
      "-dict", this._pocketsphinxOpts.dict,
      "-adcdev", this._pocketsphinxOpts.device,
      "-inmic", "yes",
      "-samprate", "16000/8000/48000",
    ], { "detached": false });

    this._process.stdout.on("data", this._onStdout.bind(this));
    this._process.stderr.on("data", this._onStderr.bind(this));
    this._process.on("close", this._onClose.bind(this));
    this._process.on("error", this._onClose.bind(this));
    this._process.on("exit", this._onClose.bind(this));

    return Promise.resolve();
  }

  /**
   * Stops the driver
   * Kills any child processes
   * @return {Promise} resolves when done
   **/
  stop() {
    this.log.info("SpeechIn.stop()");
    if (this._process !== null) {
      this._process.kill();
      this._process = null;
    }
    this._resetCurrent();
    return Promise.resolve();
  }

  /**
   * Stops, then starts the driver
   **/
  restart() {
    return this.stop()
      .then(this.start.bind(this));
  }

  /********************************
   * PRIVATE METHODS
   ********************************/

  /**
   * Resets _current to an empty value.
   * Because data from the child process comes in asynchronously,
   * we use this to store the most recent seen values
   **/
  _resetCurrent() {
    this._current = {
      "line": "",
      "score": Number.MIN_SAFE_INTEGER,
      "normalizer": Number.MIN_SAFE_INTEGER,
      "joint": Number.MIN_SAFE_INTEGER,
    };
  }

  /**
   * Callback for data from stdout on the child process
   * speech recognition results come out on stdout
   * @param {string} data
   **/
  _onStdout(data) {
    data = data.toString();
    // Remove subsequent lines
    data = data.substring(0, data.indexOf("\n"));
    data = data.trim();
    data = data.replace(/-/g, " ");
    data = data.toLowerCase();

    // Ignore empty commands
    if (data !== "") {
      this._current.line = data;
      this.emit("command", this._current);
      this._resetCurrent();
    }
  }

  /**
   * Callback for data from stderr on the child process
   * confidence scores come out on stderr
   * @param {string} data
   **/
  _onStderr(data) {
    data = data.toString();
    // Remove subsequent lines
    function getScore(selector, delim) {
      const index = data.indexOf(selector) + selector.length;
      let score = data.substring(index);
      score = score.substring(0, score.indexOf("\n"));
      score = score.substring(score.lastIndexOf(delim) + 1);
      score = score.trim();
      score = parseInt(score);
      return score;
    }

    if (data.indexOf(SCORE_SELECTOR) > -1) {
      this._current.score = getScore(SCORE_SELECTOR, ":");
    }
    if (data.indexOf(NORMALIZER_SELECTOR) > -1) {
      this._current.normalizer = getScore(NORMALIZER_SELECTOR, "=");
    }
    if (data.indexOf(JOINT_SELECTOR) > -1) {
      this._current.joint = getScore(JOINT_SELECTOR, "=");
    }
  }

  /**
   * Callback when pocketsphinx process stops (usually from error)
   **/
  _onClose(code) {
    this.log.warn("pocketsphinx process closed with code=" + code);
    // Restart everything after a short delay
    //setTimeout(this.restart.bind(this), RESTART_DELAY);
  }

}

module.exports = SpeechIn;
