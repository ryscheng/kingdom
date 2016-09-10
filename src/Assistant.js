"use strict";

class Assistant {
  constructor() {
    // Private
    this._plugins = [];     // List of plugins
    this._interfaces = [];  // List of interfaces
    this._intents = [];     // Intent matchers

    this._initHelp();
  }

  _initHelp() {
    this.addPlugin({
      "name": "General",
      "intents": {
        "help" : {
          "name": "help",
          "description": "Get help with commands",
          "callback": (index) => {
            if (index === null || typeof index === "undefined") {
              this.printIntents();
              return Promise.resolve("Done");
            }

            console.log("General.help(" + index + ")");
            const plugin = this._intents[index].plugin;
            const intent = this._intents[index].intent;
            console.log("[" + plugin.name + "]" + ":" + intent.name);
            console.log("Utterances:");
            intent.utterances.forEach((utt) => {
              console.log("- " + utt);
            });
            console.log("Parameters:");
            intent.parameters.forEach((param) => {
              console.log("*" + param.name + ":");
              plugin.types[param.type].forEach((type) => {
                console.log("- " + type);
              });
            });

            return Promise.resolve("Woo");
          },
          "parameters": [ { "name": "Plugin", "type": "PLUGIN_NAME" } ],
          "utterances": [ "help", "help *Plugin" ],
        }
      },
      "types": { "PLUGIN_NAME": [] },
    });
  }

  _commandToRegExp(phrase) {
    const optionalParam = /\s*\((.*?)\)\s*/g;
    const optionalRegex = /(\(\?:[^)]+\))\?/g;
    const namedParam = /(\(\?)?:\w+/g;
    const splatParam = /\*\w+/g;
    const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#]/g;
    let command = phrase.replace(escapeRegExp, "\\$&")
                        .replace(optionalParam, "(?:$1)?")
                        .replace(namedParam, function(match, optional) {
                          return optional ? match : "([^\\s]+)";
                        }).replace(splatParam, "(.*?)").replace(optionalRegex, "\\s*$1?\\s*");
    return new RegExp("^" + command + "$", "i");
  }

  _onCommand(iface, phrase) {
    phrase = phrase.trim().toLowerCase();

    //@todo replace with conversations
    this.launchIntent(phrase).then(function(iface1, response) {
      this._interfaces.forEach((i) => {
        i.respond(response);
      });
      iface1.startListening();
    }.bind(this, iface)).catch(function(iface2, err) {
      console.error(err);
      iface2.startListening();
    }.bind(this, iface));
  }

  launchIntent(phrase) {
    for (let i = 0; i < this._intents.length; i++) {
      let result = this._intents[i].regex.exec(phrase)
      if (result) {
        let parameters = result.slice(1);
        console.log("Matches " + this._intents[i].plugin.name + ":" + this._intents[i].utterance);
        return this._intents[i].intent.callback.apply(this, parameters);
      }
    }
    return Promise.reject(new Error("Unrecognized command"));
  }

  addPlugin(plugin) {
    // Add to _plugins
    this._plugins.push(plugin);

    // Add to _intents
    Object.keys(plugin.intents).forEach(function(plugin1, intentKey) {
      const intent = plugin1.intents[intentKey];
      intent.utterances.forEach(function(plugin2, intent2, utt) {
        this._intents.push({
          "utterance": utt,
          "regex": this._commandToRegExp(utt),
          "plugin": plugin2,
          "intent": intent2,
        });
      }.bind(this, plugin1, intent));
    }.bind(this, plugin));

    // The help plugin
    this._plugins[0].types["PLUGIN_NAME"].push(plugin.name);
  }

  addInterface(iface) {
    this._interfaces.push(iface);
    iface.on("command", this._onCommand.bind(this, iface));
    iface.startListening();
  }

  printIntents() {
    console.log("Registered Intents:");
    let current, last = null;
    for (let i = 0; i < this._intents.length; i++) {
      current = this._intents[i];
      if (last === null ||
          current.plugin.name !== last.plugin.name ||
          current.intent.name !== last.intent.name) {
        console.log(i + ". " + "[" + current.plugin.name + "]:" + current.intent.name + ": " + current.intent.description);
      }
      last = current;
    }
    return Promise.resolve("Done");
  }

}

module.exports = Assistant;

