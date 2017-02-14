"use strict";

const EventEmitter = require("events");
const fs = require('fs');
const path = require('path');
const cv = require("opencv");
const express = require('express');
const http = require('http');
const socketio = require('socket.io')

class WebService extends EventEmitter {
  constructor() {
    super();
    this._app = express();
    this._server = http.Server(this._app);
    this._io = socketio(this._server);
    this._sockets = {};
    this._latestImage = null;

    this._setupRoutes();
    this._server.listen(8000, () => {
      console.log('listening on *:8000');
    });
  }

  _setupRoutes() {
    //app.use('/', express.static(path.join(__dirname, 'stream')));
    this._app.get('/cam/image_stream.jpg', (req, res) => {
      //res.sendFile(__dirname + '/index.html');
      if (this._latestImage != null) {
        res.send(this._latestImage.toBuffer());
      }
    });
    this._app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, "../public/webcam.html"));
    });
    this._io.on('connection', (socket) => {
      this._sockets[socket.id] = socket;
      console.log("Total clients connected : ", Object.keys(this._sockets).length);
      socket.on('disconnect', () => {
        delete this._sockets[socket.id];
      });
      socket.on('start-stream', () => {
        this._startStreaming();
      });
    });

  }

  _startStreaming() {
    try {
      const vid = new cv.VideoCapture(0);
      const intId = setInterval(() => {
        vid.read((err, im) => {
          if (err) throw err;
          //console.log(im.size())
          //im.save('./stream/image_stream.jpg')
          this._latestImage = im
          this.emit("image", im);
          this._io.sockets.emit('liveStream', '/cam/image_stream.jpg?_t=' + (Math.random() * 100000));
        });
      }, 200);
    } catch (e) {
      console.error(e);
    }
    console.log('Watching for changes...');
  }

}

module.exports = WebService;
