"use strict";

let hypejs = require("hype.js");
let hypemStream = require("hypem-stream");
let Q = require("q");

class HypeMachine {
  constructor(audioOut, username) {
    // Public properties
    this.name = "Hype Machine"
    this.triggers = {
      "queue :playlist hype": this.queue.bind(this),
    };
    this._cachedResult = null;

    this._audioOut = audioOut;
    this._username = username;
  }

  queue(playlist) {
    console.log("HypeMachine.queue("+playlist+")");
    let ref; 
    let response = "";
    const refs = {
      my: hypejs.profile.loved.bind(hypejs.profile, this._username),
      feed: hypejs.profile.feed.bind(hypejs.profile, this._username),
      history: hypejs.profile.history.bind(hypejs.profile, this._username),
      obsessed: hypejs.profile.obsessed.bind(hypejs.profile, this._username),
      popular: hypejs.popular.now,
      latest: hypejs.latest.all,
    };
    // Set defaults
    if (!refs.hasOwnProperty(playlist) ||
        playlist == null || 
        typeof playlist === "undefined") {
      ref = refs["my"];
      response += "unrecognized playlist. defaulting to my favorites. ";
    } else {
      ref = refs[playlist];
    }

    // Get playlist information
    return Q.nfapply(ref, [ "0" ]).then((result) => {
      this._cachedResult = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i] !== null && typeof result[i] === "object" && result[i].hasOwnProperty("tracks")) {
          const tracks = result[i].tracks;
          for (let j = 0; j < result[i].tracks.length; j++) {
            const current = result[i].tracks[j]
            this._cachedResult.push({
              id: current.id,
              artist: current.artist,
              title: current.song,
            });
          }
        }
      }

      let promises = [];
      for (let i = 0; i < this._cachedResult.length; i++) {
        promises.push(Q.nfapply(hypemStream.song, [ this._cachedResult[i].id ]));
      }
      return Q.all(promises);
    }).then((result) => {
      for (let i = 0; i < result.length; i++) {
        this._cachedResult[i].mp3stream = result[i];
        this._audioOut.queueSong(this._cachedResult[i]);
      }
      console.log(this._cachedResult);
      response += "ready to play";
      return Promise.resolve(response);
    });
  }

}

module.exports = HypeMachine;
