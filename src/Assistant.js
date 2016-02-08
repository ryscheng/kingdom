"use strict";


class Assistant {
  constructor() {
    this._plugins = [];
    this._interfaces = [];
    this._triggers = [];
  }

  _commandToRegExp(phrase) {
    const optionalParam = /\s*\((.*?)\)\s*/g;
    const optionalRegex = /(\(\?:[^)]+\))\?/g;
    const namedParam = /(\(\?)?:\w+/g;
    const splatParam = /\*\w+/g;
    const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#]/g;
    let command = phrase.replace(escapeRegExp, '\\$&')
                     .replace(optionalParam, '(?:$1)?')
                     .replace(namedParam, function(match, optional) {
                       return optional ? match : '([^\\s]+)';
                     }).replace(splatParam, '(.*?)').replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  }

  printTriggers() {
    console.log("Registered Triggers:");
    for (let i = 0; i < this._triggers.length; i++) {
      console.log("[" + this._triggers[i].plugin.name + "] " + this._triggers[i].phrase);
    }
  }

  addPlugin(plugin) {
    this._plugins.push(plugin);
    // Enumerate plugin's triggers
    for (let phrase in plugin.triggers) {
      if (plugin.triggers.hasOwnProperty(phrase)) {
        // Check if valid function
        if (typeof plugin.triggers[phrase] !== "function") {
          console.error("Assistant.addPlugin: invalid trigger for " + plugin.name + ": " + phrase)
          continue;
        }

        // Add to list of triggers
        let commandRegEx = this._commandToRegExp(phrase);
        this._triggers.push({
          phrase: phrase,
          command: commandRegEx,
          plugin: plugin,
          callback: plugin.triggers[phrase],
        });
      }
    }
  }

  addInterface(iface) {
    this._interfaces.push(iface);
    iface.on("command", (phrase) => {
      this.command(phrase.trim()).then(function(iface, response) {
        this._interfaces.forEach((i) => {
          i.respond(response);
        });
        iface.startListening();
      }.bind(this, iface)).catch(function(iface, err) {
        iface.respond("Error, " + err);
        console.error(err);
        iface.startListening();
      }.bind(this, iface));
    });
  }

  command(phrase) {
    for (let i = 0; i < this._triggers.length; i++) {
      let result = this._triggers[i].command.exec(phrase)
      if (result) {
        let parameters = result.slice(1);
        console.log("Matches " + this._triggers[i].plugin.name + ":" + this._triggers[i].phrase);
        return this._triggers[i].callback.apply(this, parameters);
      }
    }
    return Promise.reject("Unrecognized command");
  }
}

module.exports = Assistant;

