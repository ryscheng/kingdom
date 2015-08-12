import { EventEmitter } from "events";
import util from "util";

export class Messaging extends EventEmitter {
  constructor () {
    super();
    this.testVar = "TEST";
  }

  toString() {
    return `[Messaging]: ${this.testVar}`;
  }

  sendMessage(to, msg) {
    this.emit("asdf");
  }
  
}

