"use strict";

const readline = require("readline");
const EventEmitter = require("events");

class CLI extends EventEmitter {

  constructor() {
    super();
    this._rl = readline.createInterface(process.stdin, process.stdout);
    this._rl.setPrompt("Yes?>");
    this._rl.on("line", this._onLine.bind(this));
    this._rl.on("close", this._onClose.bind(this));
  }

  _onLine(line) {
    this.emit("command", line);
  }

  _onClose() {
    console.log("\nHave a great day!");
    process.exit(0);
  }

  startListening() {
    this._rl.prompt();
  }

  respond(response) {
    console.log(response);
  }

}

module.exports = CLI;
