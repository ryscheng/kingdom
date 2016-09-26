"use strict";
const ChildProcess = require("child_process");
const EventEmitter = require("events");

const SCORE_SELECTOR = "Bestpath score:";

class SpeechIn extends EventEmitter {
  constructor(pocketsphinxOpts) {
    super();
    this._lastScore = 0;

    // this.emit(event, data);
    this._process = ChildProcess.spawn(pocketsphinxOpts.bin, [
      "-hmm", pocketsphinxOpts.hmm,
      "-lm", pocketsphinxOpts.lm,
      "-dict", pocketsphinxOpts.dict,
      "-samprate", "16000/8000/48000",
      "-inmic", "yes",
      "-adcdev", "sysdefault",
    ], { detached: false });

    this._process.stdout.on("data", this._onStdout.bind(this));
    this._process.stderr.on("data", this._onStderr.bind(this));
    this._process.on("close", this._onClose.bind(this));
    // For some reason, child processes aren't automatically killed on Mac OS X
    process.on("exit", () => {
      this._process.kill()
    })
  }

  _onStdout(data) {
    data = data.toString();
    // Remove subsequent lines
    data = data.substring(0, data.indexOf("\n"))
    data = data.trim();
   
    // Ignore empty commands
    if (data != "") {
      const command = {
        line: data,
        score: this._lastScore,
      }
      this.emit("command", command);
    }
  }

  _onStderr(data) {
    data = data.toString();
    // Remove subsequent lines

    if (data.indexOf(SCORE_SELECTOR) > -1) {
      const index = data.indexOf(SCORE_SELECTOR) + SCORE_SELECTOR.length;
      let score = data.substring(index);
      score = score.substring(0, data.indexOf("\n"))
      score = parseInt(score);
      this._lastScore = score;
    }
  }

  _onClose(code) {
    console.log("Pocketsphinx process closed with code=" + code);
  }

}

module.exports = SpeechIn;
