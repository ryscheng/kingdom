import { EventEmitter } from "node:events";

interface UserInterface extends EventEmitter {
  startListening(): void;
  respond(output: string): void;
}

export { UserInterface };
