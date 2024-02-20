import winston, { Logger } from "winston";
import { AudioBuffer } from "audio-buffer";
import { load } from "audio-loader";

/**
 * Song represents all of the data associated with a song to play,
 *  including the AudioBuffer.
 *  - Will lazy fetch the AudioBuffer
 **/
class Song {
  _log: Logger;
  artist: string;
  title: string;
  url: string;
  buffer?: AudioBuffer;

  /**
   * Constructs new Song
   * @param{string} artist - artists name
   * @param{string} title - song title
   * @param{string} url - URL to the resource - Must be an HTTP(S) link to an mp3
   **/
  constructor(artist: string, title: string, url: string) {
    this._log = winston.loggers.get("misc");
    this.artist = artist;
    this.title = title;
    this.url = url;
  }

  /**
   * Fetches a playable buffer of audio
   * @return{AudioBuffer}
   **/
  async getAudioBuffer() {
    this._log.verbose(
      "Song.createStream() for " + this.artist + " - " + this.title,
    );

    if (!this.buffer) {
      this.buffer = await load(this.url);
    }
    return this.buffer;
  }
}

export { Song };
