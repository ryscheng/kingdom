const cv = require("opencv");
const EventEmitter = require("events");

const CAMERA_INTERVAL = 20;
const CHECK_INTERVAL = 500;

class Camera extends EventEmitter {
  constructor() {
    super();
    this._camera = new cv.VideoCapture(0);
    //this._window = new cv.NamedWindow('Video', 0)
    this._intervalIds = [];
    this._prevImg = null;
    this._currImg = null;
    this._nextImg = null;
  }

  start() {
    this._intervalIds.push(setInterval(this._readImage.bind(this), CAMERA_INTERVAL));
    this._intervalIds.push(setInterval(this._checkMotion.bind(this), CHECK_INTERVAL));
  }

  stop() {
    this._intervalIds.forEach((id) => {
      clearInterval(id);
    });
    this._intervalIds = [];
  }

  _readImage() {
    this._camera.read((err, im) => {
      if (err) {
        throw err;
      }
      im.convertGrayscale();
      this._prevImg = this._currImg;
      this._currImg = this._nextImg;
      this._nextImg = im;
      
      // SHOW
      /**
      if (im.size()[0] > 0 && im.size()[1] > 0){
        this._window.show(im);
      }
      this._window.blockingWaitKey(0, 50);
      **/
    });
  }

  _checkMotion() {
    if (this._prevImg === null ||
       this._currImg === null ||
       this._nextImg === null) {
      return;
    }

    /**
    cv.ImageSimilarity(this._nextImg, this._currImg, (err, result) => {
      console.log("!!!!")
      console.log(err);
      console.log(result);
    });
    **/

  }
}

module.exports = Camera;
