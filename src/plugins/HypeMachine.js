"use strict";

let hypejs = require("hype.js");
let hypemStream = require("hypem-stream");
let Q = require("q");

class HypeMachine {
  constructor(username) {
    // Public properties
    this.name = "Hype Machine"
    this.triggers = {
      "play :playlist hype": this.play.bind(this),
    };
    this.queue = [];

    this._username = username;
  }

  play(playlist) {
    console.log("HypeMachine.play("+playlist+")");
    let ref; 
    const refs = {
      my: hypejs.profile.loved.bind(hypejs.profile, this._username),
      popular: hypejs.popular.now,
    };
    // Set defaults
    if (!refs.hasOwnProperty(playlist) ||
        playlist == null || 
        typeof playlist === "undefined") {
      ref = refs["my"];
    } else {
      ref = refs[playlist];
    }

    return Q.nfapply(ref, [ "0" ]).then((result) => {
      for (let i = 0; i < result.length; i++) {
        if (result[i] !== null && typeof result[i] === "object" && result[i].hasOwnProperty("tracks")) {
          const tracks = result[i].tracks;
          for (let j = 0; j < result[i].tracks.length; j++) {
            this.queue.push(result[i].tracks[j]);
          }
        }
      }
      return Promise.resolve("Woo");
    });
  }
}

module.exports = HypeMachine;
