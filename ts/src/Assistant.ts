import { Plugin } from "./types/Plugin.js";
import { Intent } from "./types/Intent.js";
import { UserInterface } from "./types/UserInterface.js";
import { normalize } from "./utils.js";

interface Utterance {
  utterance: string;
  regex: RegExp;
  plugin: Plugin;
  intent: Intent;
}

class Assistant {
  _plugins: Plugin[];
  _utterances: Utterance[];
  _interfaces: UserInterface[];

  constructor() {
    // Private
    this._plugins = []; // List of plugins
    this._utterances = []; // Intent matchers
    this._interfaces = []; // List of interfaces

    this._initHelp();
  }

  _initHelp() {
    this.addPlugin({
      name: "General",
      intents: [
        {
          name: "help",
          description: "Get help with commands",
          callback: (name?: string) => {
            const normalizedName = name ? normalize(name) : name;
            const plugin = this._plugins.find(
              (p) => normalize(p.name) === normalizedName,
            );
            if (!name || !plugin) {
              this.printPlugins();
              return Promise.resolve("Done");
            }
            console.log("General.help(" + name + ")");

            for (const intent of plugin.intents) {
              console.log("[" + plugin.name + "]" + ":" + intent.name);
              console.log("Utterances:");
              intent.utterances.forEach((utt: string) => {
                console.log("- " + utt);
              });
              console.log("Parameters:");
              intent.parameters.forEach((param) => {
                console.log("*" + param.name + ":");
                plugin.types[param.type].forEach((type) => {
                  console.log("- " + type);
                });
              });
            }

            return Promise.resolve("Woo");
          },
          parameters: [{ name: "Plugin", type: "PLUGIN_NAME" }],
          utterances: ["help", "help *Plugin"],
        },
      ],
      types: { PLUGIN_NAME: [] },
    });
  }

  _commandToRegExp(phrase: string) {
    const optionalParam = /\s*\((.*?)\)\s*/g;
    const optionalRegex = /(\(\?:[^)]+\))\?/g;
    const namedParam = /(\(\?)?:\w+/g;
    const splatParam = /\*\w+/g;
    const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#]/g;
    let command = phrase
      .replace(escapeRegExp, "\\$&")
      .replace(optionalParam, "(?:$1)?")
      .replace(namedParam, function (match, optional) {
        return optional ? match : "([^\\s]+)";
      })
      .replace(splatParam, "(.*?)")
      .replace(optionalRegex, "\\s*$1?\\s*");
    return new RegExp("^" + command + "$", "i");
  }

  async onCommand(iface: UserInterface, rawPhrase: string) {
    const phrase = normalize(rawPhrase);

    //@todo replace with conversations
    try {
      const response = await this.launchIntent(phrase);
      this._interfaces.forEach((i) => {
        i.respond(response);
      });
      iface.startListening();
    } catch (err) {
      console.error(err);
      iface.startListening();
    }
  }

  launchIntent(phrase: string) {
    for (const u of this._utterances) {
      const result = u.regex.exec(phrase);
      if (result) {
        const parameters = result.slice(1);
        console.log(
          `Matches ${u.plugin.name}: '${u.utterance}' with args ${parameters}`,
        );
        return u.intent.callback(...parameters);
      }
    }
    throw new Error("Unrecognized command");
  }

  addPlugin(plugin: Plugin) {
    // Add to _plugins
    this._plugins.push(plugin);

    // Add to _intents
    plugin.intents.forEach((intent) => {
      intent.utterances.forEach((utt) => {
        this._utterances.push({
          utterance: utt,
          regex: this._commandToRegExp(utt),
          plugin: plugin,
          intent: intent,
        });
      });
    });

    // The help plugin
    this._plugins[0].types["PLUGIN_NAME"].push(plugin.name);
  }

  addPlugins(...plugins: Plugin[]) {
    plugins.forEach((p) => this.addPlugin(p));
  }

  addInterface(iface: UserInterface) {
    this._interfaces.push(iface);
    iface.on("command", (line: string) => this.onCommand(iface, line));
    iface.startListening();
  }

  addInterfaces(...interfaces: UserInterface[]) {
    interfaces.forEach((i) => this.addInterface(i));
  }

  printPlugins() {
    console.log("Registered plugins:");
    for (const p of this._plugins) {
      console.log(`[${p.name}]`);
      for (const i of p.intents) {
        console.log(`- ${i.description}`);
      }
    }
    console.log("Use 'help PLUGIN_NAME' to get more info");
  }
}

export { Assistant };
