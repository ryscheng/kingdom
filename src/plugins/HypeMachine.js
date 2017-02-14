"use strict";

const winston = require("winston");
const hypejs = require("hype.js");
const needle = require("needle");
const lame = require("lame");
const Q = require("q");
//const lazystream = require("lazystream");

/**
 * HypeMachine plugin
 * Retrieves links from Hype Machine and queues up songs to the AudioOut driver
 **/
class HypeMachine {
  
  /**
   * Initializes plugin
   * @param{AudioOut} audioOut - driver
   * @param{string} username - hypem.com username
   **/
  constructor(audioOut, username) {
    // Private variables
    this.log = winston.loggers.get("plugins");
    this._audioOut = audioOut;  // driver
    this._username = username;  // hypem.com username
    this._cachedResult = null;  // caches results from hypem API
    this._queries= {            // list of hypejs calls
      "my": hypejs.profile.loved.bind(hypejs.profile, this._username),
      "feed": hypejs.profile.feed.bind(hypejs.profile, this._username),
      "history": hypejs.profile.history.bind(hypejs.profile, this._username),
      "obsessed": hypejs.profile.obsessed.bind(hypejs.profile, this._username),
      "popular": hypejs.popular.now,
      "latest": hypejs.latest.all,
    };

    // Plugin properties
    this.name = "Hype Machine";
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
    };
    /**
    this.triggers = {
      "queue :playlist hype": this.queue.bind(this),
    };
    **/
  }

  /**
   * Handler for `queue` intent
   * If `playlist` exists in this._queries, get that playlist
   * Otherwise, default to favorites.
   * Retrieve a list of urls and queue it into the AudioOut driver
   * @param{string} playlist - name of the playlist
   * @return{Promise.<string>} - user response
   **/
  queue(playlist) {
    this.log.info("HypeMachine.queue("+playlist+")");
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
          const tracks = result[i].tracks;
          for (let j = 0; j < tracks.length; j++) {
            const current = tracks[j];
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
            .pipe(new lame.Decoder());
            //.once("format", (format) => {})
            //.once("finish", () => {});
        }.bind(this, this._cachedResult[i]._mp3url);
        /**
        this._cachedResult[i].mp3stream = new lazystream.Readable(function(url, opts) {
          return needle.get(url, { compressed: true, follow_max: 5 });
        }.bind(this, this._cachedResult[i]._mp3url));
        this._cachedResult[i].mp3stream.on("error", function(entry, error) {
          this.log.error("lazystream:" + error + ": " + entry.artist + " - " + entry.title);
        }.bind(this, this._cachedResult[i]));
        **/
        this._audioOut.queueSong(this._cachedResult[i]);
      }
      //this.log.debug(this._cachedResult);
      response += "ready to play";
      return Promise.resolve(response);
    });
  }

}

module.exports = HypeMachine;
