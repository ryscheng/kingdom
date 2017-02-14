"use strict";

/**
 * Song represents all of the data associated with a song to play,
 *  including the stream
 **/
class Song {

  constructor() {
    this._artist = "";
    this._title = "";
  }

  getArtist() {
    return this._artist;
  }

  getTitle() {
    return this._title;
  }

  createStream() {
  }
}

module.exports = Song;
