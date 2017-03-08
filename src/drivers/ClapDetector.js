"use strict";

const clapDetector = require("clap-detector");

/**
 * Class representing the ClapDetector driver
 * ClapDetector listens for clap sequences and triggers callbacks
 *
 * Events:
 * - "clap": number // Triggered when a clap is detected
 **/
class ClapDetector extends EventEmitter {

  /**
   * Creates a new ClapDetector driver
   * @param {string} device - name of the device for `sox`
   **/
  constructor(device) {
    this._deviceName = device;
    this._running = false;
  }

  /********************************
  * PUBLIC METHODS
  ********************************/

  /**
   * Checks if the driver is started
   * @return {boolean}
   **/
  isRunning() {
    return this._running;
  }

  /**
   * Start the driver.
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("ClapDetector.start()");

    if (this._running === true) {
      this.log.warn("ClapDetector already started");
      return Promise.reject();
    }

    clapDetector.start({
      // MacOS: "coreaudio default"
      // Linux: "alsa default"
      AUDIO_SOURCE: this._deviceName,     // this is your microphone input. 
      DETECTION_PERCENTAGE_START : '5%',  // minimum noise percentage threshold necessary to start recording sound
      DETECTION_PERCENTAGE_END: '5%',     // minimum noise percentage threshold necessary to stop recording sound
      CLAP_AMPLITUDE_THRESHOLD: 0.7,      // minimum amplitude threshold to be considered as clap
      CLAP_ENERGY_THRESHOLD: 0.3,         // maximum energy threshold to be considered as clap
      MAX_HISTORY_LENGTH: 10              // all claps are stored in history, this is its max length
    });

    // Register a clap detector
    clapDetector.onClap(this._onClap.bind(this))

    return Promise.resolve();
  }

  /**
   * Stops the driver
   * @todo - Does nothing atm
   * @return {Promise} resolves when done
   **/
  stop() {
    this.log.info("ClapDetector.stop()");
    return Promise.resolve();
  }

  /********************************
  * PRIVATE METHODS
  ********************************/
  /**
   * Triggered when hears a clap
   **/
  _onClap() {
    this.log.info("ClapDetector._onClap: clap detected");
    this.emit("clap", 1);
  }
}

module.exports = ClapDetector;
