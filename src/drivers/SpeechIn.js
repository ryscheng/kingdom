"use strict";
const ChildProcess = require("child_process");
const EventEmitter = require("events");

const SCORE_SELECTOR = "Bestpath score";
const NORMALIZER_SELECTOR = "Normalizer P(O)";
const JOINT_SELECTOR = "Joint P(O,S)";

class SpeechIn extends EventEmitter {
  constructor(pocketsphinxOpts) {
    super();
    this._current = {};
    this._resetCurrent();

    this._resetCurrent();
    // this.emit(event, data);
    this._process = ChildProcess.spawn(pocketsphinxOpts.bin, [
      "-hmm", pocketsphinxOpts.hmm,
      "-lm", pocketsphinxOpts.lm,
      "-dict", pocketsphinxOpts.dict,
      "-samprate", "16000/8000/48000",
      "-inmic", "yes",
      "-adcdev", "sysdefault",
    ], { "detached": false });

    this._process.stdout.on("data", this._onStdout.bind(this));
    this._process.stderr.on("data", this._onStderr.bind(this));
    this._process.on("close", this._onClose.bind(this));
    this._process.on("error", this._onClose.bind(this));
    this._process.on("exit", this._onClose.bind(this));
    // For some reason, child processes aren't automatically killed on Mac OS X
    process.on("exit", () => {
      this._process.kill();
    });
  }

  _resetCurrent() {
    this._current = {
      "line": "",
      "score": Number.MIN_SAFE_INTEGER,
      "normalizer": Number.MIN_SAFE_INTEGER,
      "joint": Number.MIN_SAFE_INTEGER,
    };
  }

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

  _onClose(code) {
    console.log("Pocketsphinx process closed with code=" + code);
  }

}

module.exports = SpeechIn;
