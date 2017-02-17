"use strict";

const winston = require("winston");
const needle = require("needle");
const lame = require("lame");

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
   * @return{Stream} stream of raw PCM data (for speaker)
   **/
  createStream() {
    return needle.get(url, { "compressed": true, "follow_max": 5 })
      .once("end", () => {})
      .pipe(new lame.Decoder());
      //.once("format", (format) => {})
      //.once("finish", () => {});
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
