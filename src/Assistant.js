"use strict";

class Assistant {
  constructor() {
    // Private
    this._plugins = [];     // List of plugins
    this._interfaces = [];  // List of interfaces
    this._intents = [];     // Intent matchers
    this._current = null;   // Current conversation/session

    this._initHelp();
  }

  _initHelp() {
    const utt = "help {Intent}";
    this._intents.push({
      utterance: utt,
      regex: this._commandToRegExp(utt),
      plugin: { name: "General" },
      intent: {
        name: "help",
        description: "Get help with commands",
        callback: () => {},
        parameters: [],
        utterances: [],
      },
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

  _onCommand(phrase) {
    phrase = phrase.trim().toLowerCase();

    if (this._current === null) {
      this.launchIntent(phrase)

    } else {

    }

    this.command(phrase).then(function(iface, response) {
      this._interfaces.forEach((i) => {
        i.respond(response);
      });
      iface.startListening();
    }.bind(this, iface)).catch(function(iface, err) {
      iface.respond("Error, " + err);
      console.error(err);
      iface.startListening();
    }.bind(this, iface));
  }

  launchIntent(phrase) {
    for (let i = 0; i < this._intents.length; i++) {
      let result = this._intents[i].regex.exec(phrase)
      if (result) {
        let parameters = result.slice(1);
        console.log("Matches " + this._intents[i].plugin.name + ":" + this._intents[i].utterance);
        return this._triggers[i].callback.apply(this, parameters);
      }
    }
    return Promise.reject(new Error("Unrecognized command"));
  }

  addPlugin(plugin) {
    // Add to _plugins
    this._plugins.push(plugin);

    // Add to _intents
    Object.keys(plugin.intents).forEach(function(plugin, intent) {
      intent.utterances.forEach(function(plugin, intent, utt) {
        this._intents[utt] = {
          utterance: utt,
          regex: this._commandToRegExp(utt),
          plugin: plugin,
          intent: intent,
        };
      }.bind(this, plugin, intent));
    }.bind(this, plugin));
  }

  addInterface(iface) {
    this._interfaces.push(iface);
    iface.on("command", this._onCommand.bind(this));
  }

  printIntents() {
    console.log("Registered Intents:");
    this._plugins.forEach((plugin) => {
      Object.keys(plugin.intents).forEach(function(plugin, intent) {
        console.log("[" + plugin.name + "]:" + intent.name + ": " + intent.description);
      }.bind(this, plugin));
    });
    return Promise.resolve("Done");
  }

}

module.exports = Assistant;

