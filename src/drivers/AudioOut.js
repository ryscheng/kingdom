"use strict";

const EventEmitter = require("events");
const say = require("say");
const Volume = require("pcm-volume");
const Speaker = require("speaker");
const winston = require("winston");
const Q = require("q");

/**
 * Class representing the AudioOut driver
 * AudioOut is the driver that speaks phrases and plays songs out of the speaker
 *
 * Events:
 * - "audio": boolean  // True is audio is playing (or speaking), false if silent
 **/
class AudioOut extends EventEmitter {

  /**
   * Create an AudioOut driver
   * For a list of available voices, see https://www.npmjs.com/package/say
   * If this parameter is not specified, will use system defaults
   * @param {string} voiceName - name of the speaker's voice.
   **/
  constructor(voiceName) {
    super();
    // Private variables
    this.log = winston.loggers.get("drivers");
    this._voiceName = voiceName;
    this._songQueue = [];
    this._songStream = null;
    this._volume = null;
    this._speaker = null;
    this._ongoingSay = 0;     // Measures number of ongoing calls to `say`
    
    // Set a default voice
    if (typeof voiceName === "undefined" || voiceName === null) {
      if (process.platform === "darwin") {
        this._voiceName = "Alex";
      } else {
        // say uses Festival for Linux
        this._voiceName = null;
      }
    }
    this.log.info("AudioOut driver initialized");

  }

  /********************************
   * PUBLIC METHODS
   ********************************/

  /**
   * Checks if the driver is started
   * @return {boolean}
   **/
  isRunning() {
    return true;
  }

  /**
   * Start the driver.
   * Does nothing
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("AudioOut.start()");
    return Promise.resolve();
  }

  /**
   * Stops the driver
   * Stops any currently playing songs and tears down all streams
   * @return {Promise} resolves when done
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
    return Promise.resolve();
  }

  /**
   * Say the phrase using text-to-speech
   * @param {string} phrase - the phrase to say
   * @return {Promise} resolves if `say` succeeds, rejects on failure
   **/
  say(phrase) {
    this.log.info("AudioOut.say(" + phrase + ")");
    this._ongoingSay++;
    this._emitAudioEvt();
    // (phrase, voiceName, speed, callback)
    return Q.nfapply(say.speak, [ phrase, this._voiceName, 1.0 ]).then(() => {
      this.log.debug("AudioOut.say() finished");
      this.emit("audio", false);
      this._ongoingSay--;
      this._emitAudioEvt();
      return Promise.resolve();
    }).catch((err) => {
      this.log.debug("AudioOut.say() errored: " + JSON.stringify(err));
      this._ongoingSay--;
      this._emitAudioEvt();
      return Promise.reject(err);
    });
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

  /**
   * Sets the volume of the speaker. Does nothing if no volume object exists
   * @param{number} volume - between 0.0 and 1.0
   **/
  setVolume(volume) {
    this.log.info("AudioOut.setVolume(" + volume + ")");
    if (this._volume === null || typeof this._volume === "undefined") {
      return;
    }
    this._volume.setVolume(volume);
  }

  /**
   * Returns true if a song is playing
   * @return {boolean} true if a song is playing
   **/
  isPlaying() {
    return (this._songStream !== null &&
        this._volume !== null &&
        this._speaker !== null);
  }

  /**
   * Returns true if a song loaded but paused
   * @return {boolean}
   **/
  isPaused() {
    return (this._songStream !== null &&
        this._volume === null &&
        this._speaker === null);
  }

  /**
   * Play the first song on the playlist
   **/
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
      .once("close", this._onSongDone.bind(this));
    // Emit an event
    this._emitAudioEvt();
  }

  /**
   * Pause the current song in place
   **/
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
    // Emit an event
    this._emitAudioEvt();
  }

  /**
   * Resume the current song
   **/
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
      .once("close", this._onSongDone.bind(this));

    // Emit an event
    this._emitAudioEvt();
  }


  /********************************
   * PRIVATE METHODS
   ********************************/

  _emitAudioEvt() {
    let msg = (this._ongoingSay > 0) || this.isPlaying();
    this.log.verbose("AudioOut emits audio:" + msg);
    this.emit("audio", msg);
  }

  _onSongDone() {
    this.log.info("AudioOut._onSongDone()");
    // Emit an event
    this._emitAudioEvt();
  }

}

module.exports = AudioOut;

