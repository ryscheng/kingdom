import { Interface, createInterface } from "node:readline";
import { EventEmitter } from "node:events";
import { UserInterface } from "../types/UserInterface.js";

const PROMPT = "Yes?>";
const EXIT_MESSAGE = "\n\nHave a nice day!";

class CLI extends EventEmitter implements UserInterface {
  _rl: Interface;

  constructor() {
    super();
    this._rl = createInterface(process.stdin, process.stdout);
    this._rl.setPrompt(PROMPT);
    this._rl.on("line", (line: string) => this._onLine(line));
    this._rl.on("close", () => this._onClose());
  }

  _onLine(line: string) {
    this.emit("command", line);
  }

  _onClose() {
    console.log(EXIT_MESSAGE);
    process.exit(0);
  }

  startListening() {
    this._rl.prompt();
  }

  respond(response: string) {
    console.log(response);
  }
}

export { CLI };
