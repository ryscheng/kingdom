import { Intent } from "./Intent.js";

interface Plugin {
  readonly name: string;
  readonly intents: Intent[];
  types: Record<string, string[]>;
}

export { Plugin };
