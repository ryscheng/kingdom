"use strict";

const say = require("say");
const Volume = require("pcm-volume");
const Speaker = require("speaker");

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
    this._voiceName = voiceName;
    if (typeof voiceName === "undefined" || voiceName === null) {
      if (process.platform === "darwin") {
        this._voiceName = "Alex";
      } else {
        // say uses Festival for Linux
        this._voiceName = null;
      }
      this._voiceName = DEFAULT_VOICE;
    }

    this._songQueue = [];
    this._songStream = null;
    this._volume = null;
    this._speaker = null;
  }

  /**
   * Say the phrase using text-to-speech
   * @param {string} phrase - the phrase to say
   * @return {Promise} resolves if `say` succeeds, rejects on failure
   **/
  say(phrase) {
    return new Promise(function(phrase1, resolve, reject) {
      // (phrase, voiceName, speed, callback)
      say.speak(phrase1, this._voiceName, 1.0, function(resolve2, reject2, err) {
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
    return this._songQueue;
  }

  /**
   * Clears the playlist
   **/
  clearSongQueue() {
    this._songQueue = [];
  }

  queueSong(song) {
    this._songQueue.push(song);
  }

  dequeueSong() {
    return this._songQueue.shift();
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
    console.log("AudioOut.play()");
    if (this.getSongQueue().length <= 0) {
      // No songs to play
      console.warn("AudioOut.play(): returns. Empty song queue");
      return;
    }
    if (this.isPlaying()) {
      // Already playing something
      console.warn("AudioOut.play(): returns. Already playing");
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

  stop() {
    console.log("AudioOut.stop()");
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

  pause() {
    console.log("AudioOut.pause()");
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
    console.log("AudioOut.resume()");
    if (!this.isPaused()) {
      console.warn("AudioOut.resume: returns. Not in a resumable state");
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
    //console.log("AudioOut._onSongDone()");
    //@todo this is triggered on pause
  }

}

module.exports = AudioOut;

