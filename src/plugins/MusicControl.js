"use strict";

const clapDetector = require("clap-detector");

/**
 * MusicControl plugin
 * Sets up utterances and intents for controlling the music
 * Mostly a thin shell for the AudioOut driver
 **/
class MusicControl {
  
  /**
   * Instantiates the plugin
   * @param {AudioOut} audioOut - driver
   **/
  constructor(audioOut) {
    // Private variables
    this._audioOut = audioOut;  // AudioOut driver

    // Plugin properties
    this.name = "Music Control";
    this.intents = {
      "query": {
        "name": "query",
        "description": "Ask about next song",
        "callback": this.nextSong.bind(this),
        "parameters": [],
        "utterances": [
          "what is the next song",
        ],
      },
      "clear": {
        "name": "clear",
        "description": "Clear playlist",
        "callback": this.clear.bind(this),
        "parameters": [],
        "utterances": [
          "clear playlist",
        ],
      },
      "control": {
        "name": "control",
        "description": "Control music playback",
        "callback": this.control.bind(this),
        "parameters": [
          { "name": "Command", "type": "MUSIC_COMMANDS" },
        ],
        "utterances": [
          "*Command music",
          "*Command song",
        ],
      },
    };
    this.types = {
      "MUSIC_COMMANDS": [
        "play",
        "stop",
        "pause",
        "resume",
        "next",
        "previous",
        "repeat",
      ],
    };
    /**
    this.triggers = {
      "play music": this.play.bind(this),
      "stop music": this.stop.bind(this),
      "pause music": this.pause.bind(this),
      "resume music": this.resume.bind(this),
      "next song": this.next.bind(this),
      "previous song": this.previous.bind(this),
      "play song again": this.repeat.bind(this),
      "clear music (playlist)": this.clear.bind(this),
      "what is the next song": this.nextSong.bind(this),
    };
    **/

    clapDetector.start({
      AUDIO_SOURCE: 'coreaudio default', // this is your microphone input. 
      DETECTION_PERCENTAGE_START : '5%', // minimum noise percentage threshold necessary to start recording sound
      DETECTION_PERCENTAGE_END: '5%',  // minimum noise percentage threshold necessary to stop recording sound
      CLAP_AMPLITUDE_THRESHOLD: 0.7, // minimum amplitude threshold to be considered as clap
      CLAP_ENERGY_THRESHOLD: 0.3,  // maximum energy threshold to be considered as clap
      MAX_HISTORY_LENGTH: 10 // all claps are stored in history, this is its max length
    });
    clapDetector.onClaps(3, 2000, this._onClap.bind(this));
    //clapDetector.onClap(this._onClap.bind(this));
  }

  _onClap(delay) {
    console.log("!!!");
    this.stop();
  }

  /**
   * Meta handler for the `control` intent.
   * Calls the corresponding control function if it exists.
   * Make sure that all the elements in this.types.MUSIC_COMMANDS
   * has a corresponding function for this to work.
   * @param {string} cmd - name of command
   * @return {Promise.<string>} - user response
   **/
  control(cmd) {
    if (this.types.MUSIC_COMMANDS.indexOf(cmd) < 0) {
      return Promise.resolve(cmd + " is not a valid music command");
    }
    return this[cmd]();
  }

  /**
   *
   **/
  play() {
    console.log("MusicControl.play()");
    if (this._audioOut.getSongQueue().length <= 0) {
      return Promise.resolve("please queue up some songs first");
    }
    if (this._audioOut.isPlaying()) {
      return Promise.resolve("music already playing");
    }

    this._audioOut.play();
    return Promise.resolve("Done");
  }

  stop() {
    console.log("MusicControl.stop()");
    if (!this._audioOut.isPlaying()) {
      return Promise.resolve("no music is playing");
    }
    this._audioOut.stop();
    return Promise.resolve("Done");
  }
  
  pause() {
    console.log("MusicControl.pause()");
    if (!this._audioOut.isPlaying()) {
      return Promise.resolve("no music is playing");
    }
    if (this._audioOut.isPaused()) {
      return Promise.resolve("music already paused");
    }
    this._audioOut.pause();
    return Promise.resolve("Done");
  }

  resume() {
    console.log("MusicControl.resume()");
    if (!this._audioOut.isPaused()) {
      return Promise.resolve("nothing to resume");
    }
    this._audioOut.resume();
    return Promise.resolve("Done");
  }

  next() {
    console.log("MusicControl.next()");
    if (this._audioOut.getSongQueue().length <= 1) {
      return Promise.resolve("no more songs");
    }

    this._audioOut.stop();
    this._audioOut.dequeueSong();
    this._audioOut.play();
    return Promise.resolve("Done");
  }
  
  repeat() {
    console.log("MusicControl.again()");
    this._audioOut.stop();
    this._audioOut.play();
    return Promise.resolve("Done");
  }
  
  previous() {
    //@todo (need to restructure away from queues)
    console.log("MusicControl.previous()");
    return Promise.resolve("this feature is not ready yet");
  }

  clear() {
    console.log("MusicControl.clear()");
    this._audioOut.clearSongQueue();
    return Promise.resolve("Done");
  }

  nextSong() {
    console.log("MusicControl.nextSong()");
    let queue = this._audioOut.getSongQueue();
    let response;
    if (queue.length > 0) {
      response = queue[0].getArtist() + " and " + queue[0].getTitle();
    } else {
      response = "Song queue is empty.";
    }

    return Promise.resolve(response);
  }
}

module.exports = MusicControl;
