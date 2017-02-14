"use strict";

const say = require("say");
const Volume = require("pcm-volume");
const Speaker = require("speaker");
const winston = require("winston");

/**
 * Class representing the AudioOut driver
 * AudioOut is the driver that speaks phrases and plays songs out of the speaker
 **/
class AudioOut {

  /**
   * Create an AudioOut driver
   * For a list of available voices, see https://www.npmjs.com/package/say
   * If this parameter is not specified, will use system defaults
   * @param {string} voiceName - name of the speaker's voice.
   **/
  constructor(voiceName) {
    this.log = winston.loggers.get("drivers");
    this._voiceName = voiceName;
    if (typeof voiceName === "undefined" || voiceName === null) {
      if (process.platform === "darwin") {
        this._voiceName = "Alex";
      } else {
        // say uses Festival for Linux
        this._voiceName = null;
      }
    }

    this._songQueue = [];
    this._songStream = null;
    this._volume = null;
    this._speaker = null;
    this.log.info("AudioOut Driver initialized");
  }

  /**
   * Start the driver.
   * Does nothing
   **/
  start() {
    this.log.info("AudioOut.start()");
  }

  /**
   * Stops the driver
   * Stops any currently playing songs and tears down all streams
   **/
  stop() {
    this.log.info("AudioOut.stop()");
    if (this._songStream !== null) {
      this._songStream.unpipe();
      this._songStream.end();
      this._songStream = null;
    }

    if (this._volume !== null) {
      this._volume.end();
      this._volume = null;
    }

    if (this._speaker !== null) {
      this._speaker.end();
      this._speaker = null;
    }
  }

  /**
   * Say the phrase using text-to-speech
   * @param {string} phrase - the phrase to say
   * @return {Promise} resolves if `say` succeeds, rejects on failure
   **/
  say(phrase) {
    this.log.info("AudioOut.say(" + phrase + ")");
    return new Promise(function(phrase1, resolve, reject) {
      // (phrase, voiceName, speed, callback)
      say.speak(phrase1, this._voiceName, 1.0, function(resolve2, reject2, err) {
        this.log.verbose("AudioOut.say() finished");
        if (err) {
          reject2();
        }
        resolve2();
      }.bind(this, resolve, reject));
    }.bind(this, phrase));
  }

  /**
   * Returns the queue of songs on the playlist
   * @return {Array.<Song>}
   **/
  getSongQueue() {
    this.log.info("AudioOut.getSongQueue() returns " + this._songQueue.length + " items");
    return this._songQueue;
  }

  /**
   * Clears the playlist
   **/
  clearSongQueue() {
    this.log.info("AudioOut.clearSongQueue()");
    this._songQueue = [];
  }

  /**
   * Add a song to the queue
   * @param {Song} song - song to queue
   **/
  queueSong(song) {
    this.log.info("AudioOut.queueSong(" + song.getArtist() + ": " + song.getTitle() + ")");
    this._songQueue.push(song);
  }

  /**
   * Dequeue first song and return it
   * @return {Song} first song in the queue
   **/
  dequeueSong() {
    let song = this._songQueue.shift();
    this.log.info("AudioOut.dequeueSong() returns " + song.getArtist() + ": " + song.getTitle());
    return song;
  }

  setSongVolume(volume) {
    if (this._volume === null || typeof this._volume === "undefined") {
      return;
    }
    this._volume.setVolume(volume);
  }

  isPlaying() {
    return (this._songStream !== null &&
        this._volume !== null &&
        this._speaker !== null);
  }

  isPaused() {
    return (this._songStream !== null &&
        this._volume === null &&
        this._speaker === null);
  }

  play() {
    this.log.info("AudioOut.play()");
    if (this.getSongQueue().length <= 0) {
      // No songs to play
      this.log.warn("AudioOut.play(): returns. Empty song queue");
      return;
    }
    if (this.isPlaying()) {
      // Already playing something
      this.log.warn("AudioOut.play(): returns. Already playing");
      return;
    }

    // Stop anything that might exist
    this.stop();

    // Create new streams
    let song = this._songQueue[0];
    this._volume = new Volume();
    this._speaker = new Speaker();
    this._songStream = song.createStream();
    this._songStream
      .pipe(this._volume)
      .pipe(this._speaker)
      .once("close", () => {});
  }

  

  pause() {
    this.log.info("AudioOut.pause()");
    if (this._volume !== null) {
      this._volume.end();
      this._volume = null;
    }

    if (this._speaker !== null) {
      //this._speaker.end();
      this._speaker = null;
    }
  }

  resume() {
    this.log.info("AudioOut.resume()");
    if (!this.isPaused()) {
      this.log.warn("AudioOut.resume: returns. Not in a resumable state");
      return;
    }

    this._volume = new Volume();
    this._speaker = new Speaker();
    this._songStream
      .pipe(this._volume)
      .pipe(this._speaker)
      .once("close", () => {});
    
  }

  _onSongDone() {
    //this.log.info("AudioOut._onSongDone()");
    //@todo this is triggered on pause
  }

}

module.exports = AudioOut;

