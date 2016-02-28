"use strict";

class MusicControl {
  constructor(audioOut) {
    // Public properties
    this.name = "Music Control"
    this.triggers = {
      "play music": this.play.bind(this),
      "pause music": this.pause.bind(this),
      "next (song)": this.next.bind(this),
      "previous (song)": this.previous.bind(this),
      "play again": this.again.bind(this),
      "clear music (playlist)": this.clear.bind(this),
      "what is the next song": this.nextSong.bind(this),
    };

    this._audioOut = audioOut;
  }

  play() {
    console.log("MusicControl.play()");
    if (this._queue.length <= 0) {
      return Promise.resolve("please queue up some songs first");
    }
    
    // if already playing
    //@todo
  }
  
  pause() {
    console.log("MusicControl.pause()");

    // if already paused
    //@todo
  }

  next() {
    console.log("MusicControl.next()");
  }
  
  previous() {
    console.log("MusicControl.previous()");
  }

  again() {
    console.log("MusicControl.again()");
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
