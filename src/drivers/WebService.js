"use strict";

const winston = require("winston");
const Q = require("q");
const path = require("path");
const cv = require("opencv");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

/**
 * Class representing the WebService driver
 * In order to present a unified web interface, plugins can register routes with this centralized service
 **/
class WebService {

  /**
   * Create a new WebService driver
   * @param {number} port - port for HTTP server to listen on
   **/
  constructor(port) {
    // Private variables
    this.log = winston.loggers.get("drivers");
    this._port = port;
    this._app = express();
    this._server = http.Server(this._app);
    this._io = socketio(this._server);
    this._sockets = {};
    this._latestImage = null;

    // Setup routes
    this._setupRoutes();
    this.log.info("WebService driver initialized");
  }
  
  /********************************
   * PUBLIC METHODS
   ********************************/

  /**
   * Start the driver.
   * Starts listening on the configured port
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("WebService.start()");
    return Q.npost(this._server, "listen", [ this._port ]).then(() => {
      this.log.info("WebService is listening on *:" + this._port);
      return Promise.resolve();
    });
  }

   /**
   * Stops the driver.
   * Closes the HTTP server
   * @return {Promise} resolves when done
   **/
  stop() {
    this.log.info("WebService.stop()");
    return Q.npost(this._server, "close", []).then(() => {
      this.log.info("WebService HTTP server closed");
      return Promise.resolve();
    });
  }

  /********************************
   * PRIVATE METHODS
   ********************************/
  // @TODO - docs and logging
  _setupRoutes() {
    //app.use("/", express.static(path.join(__dirname, "stream")));
    this._app.get("/cam/image_stream.jpg", (req, res) => {
      //res.sendFile(__dirname + "/index.html");
      if (this._latestImage !== null) {
        res.send(this._latestImage.toBuffer());
      }
    });
    this._app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../public/webcam.html"));
    });
    this._io.on("connection", (socket) => {
      this._sockets[socket.id] = socket;
      console.log("Total clients connected : ", Object.keys(this._sockets).length);
      socket.on("disconnect", () => {
        delete this._sockets[socket.id];
      });
      socket.on("start-stream", () => {
        this._startStreaming();
      });
    });

  }

  _startStreaming() {
    try {
      const vid = new cv.VideoCapture(0);
      setInterval(() => {
        vid.read((err, im) => {
          if (err) {
            throw err;
          }
          //console.log(im.size())
          //im.save("./stream/image_stream.jpg")
          this._latestImage = im;
          this._io.sockets.emit("liveStream", "/cam/image_stream.jpg?_t=" + (Math.random() * 100000));
        });
      }, 200);
    } catch (e) {
      console.error(e);
    }
    console.log("Watching for changes...");
  }

}

module.exports = WebService;
