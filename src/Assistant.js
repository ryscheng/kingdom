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
          "callback": (pluginName) => {
            console.log("General.help(" + pluginName + ")");
            this._plugins.forEach((plugin) => {
              if (plugin.name.toLowerCase() === pluginName) {
                console.log("[" + plugin.name + "]");
                console.log("");
                //@todo prettyprint
                console.log(plugin);
              }
            })
            return Promise.resolve("Woo");
          },
          "parameters": [ { "name": "Plugin", "type": "PLUGIN_NAME" } ],
          "utterances": [ "help *Plugin" ],
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
  }

  printIntents() {
    console.log("Registered Intents:");
    this._plugins.forEach((plugin1) => {
      Object.keys(plugin1.intents).forEach(function(plugin2, intentKey) {
        const intent = plugin2.intents[intentKey];
        console.log("[" + plugin2.name + "]:" + intent.name + ": " + intent.description);
      }.bind(this, plugin1));
    });
    return Promise.resolve("Done");
  }

}

module.exports = Assistant;

