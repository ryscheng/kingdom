import { EventEmitter } from "node:events";
import * as ChildProcess from "node:child_process";
//const espeak = require("espeak");
//const say = require("say");           // For a list of available voices, see https://www.npmjs.com/package/say
import winston, { Logger } from "winston";
import { Song } from "../types/Song.js";

const ESPEAK_CMD = "espeak-ng";

/**
 * Class representing the AudioOut driver
 * AudioOut is the driver that speaks phrases and plays songs out of the speaker
 *
 * Events:
 * - "audio": boolean  // True is audio is playing (or speaking), false if silent
 **/
class AudioOut extends EventEmitter {
  log: Logger;
  _voiceName: string | null;
  _songQueue: Song[];
  _ongoingSay: number;

  /**
   * Create an AudioOut driver
   * If this parameter is not specified, will use system defaults
   * @param voiceName - name of the speaker's voice.
   **/
  constructor(voiceName?: string) {
    super();
    // Private variables
    this.log = winston.loggers.get("drivers");
    this._voiceName =
      voiceName ?? process.platform === "darwin" ? "Alex" : null;
    this._songQueue = [];
    this._songStream = null;
    this._ongoingSay = 0; // Measures number of ongoing calls to `say`
    this.log.info("AudioOut driver initialized");
  }

  /********************************
   * PUBLIC METHODS
   ********************************/

  /**
   * Checks if the driver is started
   * @returns boolean
   **/
  isRunning() {
    return true;
  }

  /**
   * Start the driver.
   * Does nothing
   * @returns resolves when done
   **/
  start() {
    this.log.info("AudioOut.start()");
    return Promise.resolve();
  }

  /**
   * Stops the driver
   * Stops any currently playing songs and tears down all streams
   * @returns resolves when done
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

    // Emit an event
    this._emitAudioEvt();
    return Promise.resolve();
  }

  /**
   * Say the phrase using text-to-speech
   * @param phrase - the phrase to say
   * @returns resolves if `say` succeeds, rejects on failure
   **/
  say(phrase: string): Promise<void> {
    this.log.info("AudioOut.say(" + phrase + ")");
    this._ongoingSay++;
    this._emitAudioEvt();

    return new Promise((resolve) => {
      let process = ChildProcess.spawn(ESPEAK_CMD, [phrase], {
        detached: false,
      });
      //process.stdout.on("data", () => {});
      //process.stderr.on("data", () => {});
      //process.on("close", this._onClose.bind(this));
      //process.on("error", this._onClose.bind(this));
      process.on("exit", () => {
        this.log.debug("AudioOut.say() finished");
        this._ongoingSay--;
        this._emitAudioEvt();
        return resolve();
      });
    });
    // (phrase, voiceName, speed, callback)
    //return Q.nfapply(say.speak, [ phrase, this._voiceName, 1.0 ]).then(() => {});
    //return Q.nfapply(espeak.speak, [ phrase ]).then((wav) => {});
  }

  /**
   * Returns the queue of songs on the playlist
   * @returns array of songs
   **/
  getSongQueue() {
    this.log.info(
      `AudioOut.getSongQueue() returns ${this._songQueue.length} items`,
    );
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
   * @param - song to queue
   **/
  queueSong(song: Song) {
    this.log.info(`AudioOut.queueSong(${song.artist}: ${song.title})`);
    this._songQueue.push(song);
  }

  /**
   * Dequeue first song and return it
   * @returns first song in the queue
   **/
  dequeueSong() {
    const song = this._songQueue.shift();
    const songDesc = song ? `${song.artist}: ${song.title}` : "null";
    this.log.info(`AudioOut.dequeueSong() returns ${songDesc}`);
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
   * @returns true if a song is playing
   **/
  isPlaying() {
    return (
      this._songStream !== null &&
      this._volume !== null &&
      this._speaker !== null
    );
  }

  /**
   * Returns true if a song loaded but paused
   * @returns if true if a song is paused
   **/
  isPaused() {
    return (
      this._songStream !== null &&
      this._volume === null &&
      this._speaker === null
    );
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

  /**
   * Emits event updating audio state
   * True if either music playing or TTS active
   * False if silent
   **/
  _emitAudioEvt() {
    const msg = this._ongoingSay > 0 || this.isPlaying();
    this.log.verbose("AudioOut emits audio:" + msg);
    this.emit("audio", msg);
  }

  /**
   * Triggered when song finishes playing
   **/
  _onSongDone() {
    this.log.info("AudioOut._onSongDone()");
    this.stop();
  }
}

export { AudioOut };
