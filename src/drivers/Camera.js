"use strict";

const winston = require("winston");
const cv = require("opencv");
const EventEmitter = require("events");

const LIVEFEED_INTERVAL = 20;
const MOTIONCHECK_INTERVAL = 1000;

/**
 * Class representing the Camera driver
 * Single place for interacting with the camera to conserve resources
 * Intelligently adjusts rate based on motion
 *
 * Events:
 * - "frame": OpenCV.Matrix  // An image read from webcam using opencv
 **/
class Camera extends EventEmitter {

  /**
   * Create a new Camera driver
   **/
  constructor() {
    super();
    // Private variables
    this.log = winston.loggers.get("drivers");
    this._camera = new cv.VideoCapture(0);
    this._window = new cv.NamedWindow('Video', 0)
    this._running = false;
    this._scheduled = 0;
    this._prevImg = null;
    this._currImg = null;
    this._nextImg = null;

    this.log.info("Camera driver initialized");
  }
  
  /********************************
   * PUBLIC METHODS
   ********************************/

  /**
   * Checks if the driver is started
   **/
  isRunning() {
    return this._running;
  }

  /**
   * Start the driver.
   * Starts fetching camera frames
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("Camera.start()");
    // Check if already running
    if (this.isRunning()) {
      this.log.verbose("Camera already started");
      return Promise.resolve();
    }
    // Start periodic reads
    this._running = true; 
    this._scheduleRead();
    return Promise.resolve();
  }

   /**
   * Stops the driver.
   * Should trigger all periodic callbacks to stop
   * @return {Promise} resolves when done
   **/
  stop() {
    this.log.info("Camera.stop()");
    this._running = false;
  }

  /********************************
   * PRIVATE METHODS
   ********************************/

  _scheduleRead() {
    // Ignore if there's another callback already scheduled
    if (this._scheduled > 0) {
      return;
    }

    this._scheduled += 1;

    if (this._prevImg === null ||
       this._currImg === null ||
       this._nextImg === null) {
      setTimeout(this._readImage.bind(this), LIVEFEED_INTERVAL);
    } else if (this._checkMotion() === true) {
      setTimeout(this._readImage.bind(this), LIVEFEED_INTERVAL);
    } else {
      setTimeout(this._readImage.bind(this), MOTIONCHECK_INTERVAL);
    }
  }

  // @TODO docs and logging
  _readImage() {
    this._scheduled -= 1;
    // Just ignore if user asked to stop
    if (this._running === false) {
      return;
    }
    console.log("Read");

    this._camera.read((err, im) => {
      if (err) {
        this.log.error(err);
        throw err;
      }
      console.log("got image");
      this._prevImg = this._currImg;
      this._currImg = this._nextImg;
      this._nextImg = im;

      this._scheduleRead();
      
      // SHOW
      if (im.size()[0] > 0 && im.size()[1] > 0){
        this._window.show(im);
      }
      this._window.blockingWaitKey(0, 50);
    });
  }

  _checkMotion() {
    if (this._prevImg === null ||
       this._currImg === null ||
       this._nextImg === null) {
      return false;
    }

    if (cv.ImageSimilarity === undefined) {
      console.log('TODO: Please port Features2d.cc to OpenCV 3')
      process.exit(0);
    }
    /**
    cv.ImageSimilarity(
        this._nextImg.convertGrayscale(),
        this._currImg.convertGrayscale(),
        (err, result) => {
      console.log("!!!!")
      console.log(err);
      console.log(result);
    });
    **/

  }
}

module.exports = Camera;
