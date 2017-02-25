"use strict";

const winston = require("winston");
const needle = require("needle");
const lame = require("lame");
const multipipe = require("multipipe");

/**
 * Song represents all of the data associated with a song to play,
 *  including the stream
 **/
class Song {

  /**
   * Constructs new Song
   * @param{string} artist - artists name
   * @param{string} title - song title
   * @param{string} type - resource type (currently ignored. Assumed to be 'mp3')
   * @param{string} url - URL to the resource - Must be an HTTP(S) link to an mp3
   **/
  constructor(artist, title, type, url) {
    this.log = winston.loggers.get("misc");
    this._artist = artist;
    this._title = title;
    this._type = type;
    this._url = url;
  }

  /**
   * Retrieve artist name
   * @return{string} artist name
   **/
  getArtist() {
    return this._artist;
  }

  /**
   * Retrieve song title
   * @return{string} song title
   **/
  getTitle() {
    return this._title;
  }

  /**
   * Creates a readable stream of audio data
   * NOTE: Currently assumes the url is an HTTP(S) link to an mp3
   * @param{Object.<string, string>} opts - override options for needle
   * @return{Stream} stream of raw PCM data (for speaker)
   **/
  createStream(opts) {
    this.log.verbose("Song.createStream() for " + this._artist + " - " + this._title);

    // Mix in opts parameter
    let needleOpts = {
      "open_timeout": 5000,
      "read_timeout": 0,
      "follow_max": 5,
      // HTTP Headers
      "compressed": true,
      "connection": "Close",
    };
    if (opts !== null && typeof opts !== "undefined") {
      Object.keys(opts).forEach((k) => {
        needleOpts[k] = opts[k];
      });
    }

    let stream = multipipe(
      needle.get(this._url, needleOpts),
      new lame.Decoder()
    );
    return stream;
      //.once("error", () => {})
      //.once("format", (format) => {})
    /**
    this._cachedResult[i].mp3stream = new lazystream.Readable(function(url, opts) {
      return needle.get(url, { compressed: true, follow_max: 5 });
    }.bind(this, this._cachedResult[i]._mp3url));
    this._cachedResult[i].mp3stream.on("error", function(entry, error) {
      this.log.error("lazystream:" + error + ": " + entry.artist + " - " + entry.title);
    }.bind(this, this._cachedResult[i]));
    **/
  }
}

module.exports = Song;
