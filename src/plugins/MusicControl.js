"use strict";

class MusicControl {
  constructor(audioOut) {
    // Private
    this._audioOut = audioOut;

    // Public properties
    this.name = "Music Control";
    this.intents = {
      "play": {
        "name": "play",
        "description": "Play music",
        "callback": this.getWeather.bind(this),
        "parameters": [
          { "name": "Location", "type": "US_CITY" },
        ],
        "utterances": [
          "weather",
          "what is the weather",
          "what's the weather",
          "weather in {Location}",
          "what is the weather in {Location}",
          "what's the weather in {Location}",
        ],
      }
    };
    this.types = {};
    /**
    this.triggers = {
      "play music": this.play.bind(this),
      "stop music": this.stop.bind(this),
      "pause music": this.pause.bind(this),
      "resume music": this.resume .bind(this),
      "clear music (playlist)": this.clear.bind(this),
      "next song": this.next.bind(this),
      "previous song": this.previous.bind(this),
      "play song again": this.again.bind(this),
      "what is the next song": this.nextSong.bind(this),
    };
    **/
  }

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
  
  again() {
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
      response = queue[0].artist + " and " + queue[0].title;
    } else {
      response = "Song queue is empty."
    }

    return Promise.resolve(response);
  }
}

module.exports = MusicControl;
