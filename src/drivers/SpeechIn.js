"use strict";
const ChildProcess = require("child_process");
const EventEmitter = require("events");

const SCORE_SELECTOR = "Bestpath score:";

class SpeechIn extends EventEmitter {
  constructor(pocketsphinxOpts) {
    super();
    this._count = {
      emitted: 0,
      line: 0,
      score: 0,
    }
    this._last = {
      line: "",
      score: 0,
    }

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
    this._last.line = data;
    this._count.line++;
    this._checkEmit();
  }

  _onStderr(data) {
    data = data.toString();
    // Remove subsequent lines

    if (data.indexOf(SCORE_SELECTOR) > -1) {
      const index = data.indexOf(SCORE_SELECTOR) + SCORE_SELECTOR.length;
      let score = data.substring(index);
      score = score.substring(0, data.indexOf("\n"))
      score = parseInt(score);
      this._last.score = score;
      this._count.score++;
      this._checkEmit();
    }
  }

  _checkEmit() {
    if (this._count.emitted < this._count.line &&
       this._count.line === this._count.score) {
      const command = JSON.parse(JSON.stringify(this._last))
      // Ignore empty commands
      if (command.line !== "") {
        this.emit("command", command);
        console.log(command);
      }
      this._count.emitted++;
    }
  }

  _onClose(code) {
    console.log("Pocketsphinx process closed with code=" + code);
  }

}

module.exports = SpeechIn;
