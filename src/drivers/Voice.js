"use strict";
let espeak = require("espeak");


class Mouth {
  constructor() {
  }

  say(phrase) {
    espeak.speak(phrase, (err, wav) => {
      
    });
  }
}

var m = new Mouth();
m.say("Hello");

module.exports.Mouth = Mouth;
