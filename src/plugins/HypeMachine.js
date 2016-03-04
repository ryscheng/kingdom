"use strict";

const hypejs = require("hype.js");
const needle = require("needle");
const lame = require("lame");
const Q = require("q");
//const lazystream = require("lazystream");

class HypeMachine {
  constructor(audioOut, username) {
    // Private
    this._audioOut = audioOut;
    this._username = username;
    this._cachedResult = null;
    this._queries= {
      "my": hypejs.profile.loved.bind(hypejs.profile, this._username),
      "feed": hypejs.profile.feed.bind(hypejs.profile, this._username),
      "history": hypejs.profile.history.bind(hypejs.profile, this._username),
      "obsessed": hypejs.profile.obsessed.bind(hypejs.profile, this._username),
      "popular": hypejs.popular.now,
      "latest": hypejs.latest.all,
    };

    // Public properties
    this.name = "Hype Machine"
    this.intents = {
      "queue": {
        "name": "queue",
        "description": "Queue songs from HypeM",
        "callback": this.queue.bind(this),
        "parameters": [
          { "name": "Playlist", "type": "HYPEM_PLAYLISTS" },
        ],
        "utterances": [
          "queue *Playlist hype",
        ],
      }
    };
    this.types = {
      "HYPEM_PLAYLISTS": Object.keys(this._queries),
    }
    /**
    this.triggers = {
      "queue :playlist hype": this.queue.bind(this),
    };
    **/
  }

  queue(playlist) {
    console.log("HypeMachine.queue("+playlist+")");
    let ref;
    let response = "";

    // Set defaults
    if (!this._queries.hasOwnProperty(playlist) ||
        playlist === null ||
        typeof playlist === "undefined") {
      ref = this._queries["my"];
      response += "unrecognized playlist. defaulting to my favorites. ";
    } else {
      ref = this._queries[playlist];
    }

    // Get playlist information
    return Q.nfapply(ref, [ "0" ]).then((result) => {
      this._cachedResult = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i] !== null && typeof result[i] === "object" && result[i].hasOwnProperty("tracks")) {
          const tracks = tracks;
          for (let j = 0; j < tracks.length; j++) {
            const current = tracks[j]
            this._cachedResult.push({
              "id": current.id,
              "artist": current.artist,
              "title": current.song,
            });
          }
        }
      }

      for (let i = 0; i < this._cachedResult.length; i++) {
        this._cachedResult[i]._mp3url = "https://hypem.com/serve/public/"+this._cachedResult[i].id;
        this._cachedResult[i].createStream = function(url) {
          return needle.get(url, { "compressed": true, "follow_max": 5 })
            .once("end", () => {})
            .pipe(new lame.Decoder())
            //.once("format", (format) => {})
            //.once("finish", () => {});
        }.bind(this, this._cachedResult[i]._mp3url);
        /**
        this._cachedResult[i].mp3stream = new lazystream.Readable(function(url, opts) {
          return needle.get(url, { compressed: true, follow_max: 5 });
        }.bind(this, this._cachedResult[i]._mp3url));
        this._cachedResult[i].mp3stream.on("error", function(entry, error) {
          console.error("lazystream:" + error + ": " + entry.artist + " - " + entry.title);
        }.bind(this, this._cachedResult[i]));
        **/
        this._audioOut.queueSong(this._cachedResult[i]);
      }
      //console.log(this._cachedResult);
      response += "ready to play";
      return Promise.resolve(response);
    });
  }

}

module.exports = HypeMachine;
