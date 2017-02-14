"use strict";

const winston = require("winston");
const hypejs = require("hype.js");
const Q = require("q");
const Song = require("../types/Song");
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
    this._cachedResult = {};  // caches results from hypem API
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
   * If `playlistName` exists in this._queries, get that playlist
   * Otherwise, default to favorites.
   * Retrieve a list of urls and queue it into the AudioOut driver
   * @param{string} playlistName - name of the playlist
   * @return{Promise.<string>} - user response
   **/
  queue(playlistName) {
    this.log.info("HypeMachine.queue("+playlistName+")");
    let ref;            // function to call to get a playlist
    let response = "";  // user response

    // Set defaults
    if (!this._queries.hasOwnProperty(playlistName) ||
        playlistName === null ||
        typeof playlistName === "undefined") {
      playlistName = "my";
      response += "unrecognized playlist. defaulting to my favorites. ";
      this.log.verbose("HypeMachine.queue() defaulting to default, my favorites");
    } 
    ref = this._queries[playlistName];

    // If cached, just use cached copy
    if (Array.isArray(this._cachedResult[playlistName]) && this._cachedResult[playlistName].length > 0) {
      this.log.verbose("HypeMachine.queue() has cached playlist. Sending " + this._cachedResult[playlistName].length + " songs to AudioOut");
      for (let i = 0; i < this._cachedResult[playlistName].length; i++) {
        this._audioOut.queueSong(this._cachedResult[playlistName][i]);
      }
      response += "ready to play";
      return Promise.resolve(response);
    }

    // Get playlist information from hypem.com
    this.log.verbose("HypeMachine.queue() fetching playlist from hypem.com");
    return Q.nfapply(ref, [ "0" ]).then((result) => {
      this._cachedResult[playlistName] = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i] !== null && typeof result[i] === "object" && result[i].hasOwnProperty("tracks")) {
          const tracks = result[i].tracks;
          for (let j = 0; j < tracks.length; j++) {
            const current = tracks[j];
            let song = new Song(current.artist, current.title, "mp3", "https://hypem.com/serve/public/" + current.id);
            this._cachedResult[playlistName].push(song);
            this._audioOut.queueSong(song);
          }
        }
      }
      this.log.verbose("HypeMachine.queue() sending " + this._cachedResult[playlistName].length + " songs to AudioOut");
      response += "ready to play";
      return Promise.resolve(response);
    });
  }

}

module.exports = HypeMachine;
