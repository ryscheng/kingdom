"use strict";

const needle = require("needle");
const lame = require("lame");

/**
 * Song represents all of the data associated with a song to play,
 *  including the stream
 **/
class Song {

  constructor(artist, title, type, url) {
    this._artist = artist;
    this._title = title;
    this._type = type;
    this._url = url;
  }

  getArtist() {
    return this._artist;
  }

  getTitle() {
    return this._title;
  }

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

module.exports = Song;
