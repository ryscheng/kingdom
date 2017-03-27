"use strict";

const winston = require("winston");

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
  constructor(audioOut, claps) {
    // Private variables
    this.log = winston.loggers.get("plugins");
    this._audioOut = audioOut;  // AudioOut driver
    this._claps = claps;        // Claps driver

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
      "shuffle": {
        "name": "shuffle",
        "description": "Shuffle playlist",
        "callback": this.shuffle.bind(this),
        "parameters": [],
        "utterances": [
          "shuffle playlist",
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

    this._claps.onClaps(3, 2000, this._onClap.bind(this));
    //clapDetector.onClap(this._onClap.bind(this));
  }

  /**
   * Handler for clap sequence
   * Triggers music to stop
   * @param {number} delay
   **/
  _onClap(delay) {
    this.log.info("MusicControl._onClap: clap sequence triggered, delay=" + delay);
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
    this.log.info("MusicControl.play()");
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
    this.log.info("MusicControl.stop()");
    if (!this._audioOut.isPlaying()) {
      return Promise.resolve("no music is playing");
    }
    this._audioOut.stop();
    return Promise.resolve("Done");
  }
  
  pause() {
    this.log.info("MusicControl.pause()");
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
    this.log.info("MusicControl.resume()");
    if (!this._audioOut.isPaused()) {
      return Promise.resolve("nothing to resume");
    }
    this._audioOut.resume();
    return Promise.resolve("Done");
  }

  next() {
    this.log.info("MusicControl.next()");
    if (this._audioOut.getSongQueue().length <= 1) {
      return Promise.resolve("no more songs");
    }

    this._audioOut.stop();
    this._audioOut.dequeueSong();
    this._audioOut.play();
    return Promise.resolve("Done");
  }
  
  repeat() {
    this.log.info("MusicControl.again()");
    this._audioOut.stop();
    this._audioOut.play();
    return Promise.resolve("Done");
  }
  
  previous() {
    //@todo (need to restructure away from queues)
    this.log.info("MusicControl.previous()");
    return Promise.resolve("this feature is not ready yet");
  }

  clear() {
    this.log.info("MusicControl.clear()");
    this._audioOut.clearSongQueue();
    return Promise.resolve("Done");
  }

  shuffle() {
    this.log.info("MusicControl.shuffle()");
    let playlist = this._audioOut.getSongQueue();
    this._audioOut.clearSongQueue();
    while (playlist.length > 0) {
      let index = Math.floor(Math.random() * playlist.length);
      this._audioOut.queueSong(playlist[index]);
      playlist.splice(index, 1);
    }
    return Promise.resolve("Done");
  }

  nextSong() {
    this.log.info("MusicControl.nextSong()");
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
