"use strict";
var Q = require("q");
var hue = require("hue.js");

const APPNAME = "cray";

var hueClient = new Hue("192.168.0.13");
var lightsOn = false;

hueClient.getLights().then((result) => {
  //console.log(result);
  for (var k in result) {
    if (result.hasOwnProperty(k) && result[k].state.on == true) {
      lightsOn = true;
      break;
    }
  }
  console.log("Lights on: " + lightsOn);
}).catch((err) => {
  console.error(err)
})



//http://192.168.0.13/debug/clip.html
class Hue {
  constructor(addr) {
    this._addr = addr
    this._client = hue.createClient({
      stationIp: "192.168.0.13",
      appName: "cray"
    });
    this._cacheLights = {};
    this._init();
  }

  _init() {
    // Try to get the list of lights. Register if necessary
    this._client.lights((err, lights) => {
      if (err && err.type === 1) {
        console.log("Please go and press the link button on your base station(s)");
        this._client.register((err) => {
          if (err) {
            console.error("Error registering with Hue bridge:", err);
            return
          }
          console.log("Registered")
        });
      } else if (err) {
        console.error("Hue error: ", err)
      } else {
      }
    });
  }

  getLights() {
    var promise = Q.ninvoke(this._client, "lights");
    promise.then((lights) => {
      this._cacheLights = lights;
    })
    return promise;
  }

  _huecall(method, name, args) {
    for (var k in this._cacheLights) {
      if (this._cacheLights.hasOwnProperty(k) && this._cacheLights[k].name == name) {
        return Q.npost(this._client, method, [k].concat(args));
      }
    }
  }

  _huebroadcast(method, args) {
    var promises = []
    for (var k in this._cacheLights) {
      if (this._cacheLights.hasOwnProperty(k)) {
        promises.push(Q.npost(this._client, method, [k].concat(args)))
      }
    }
    return Q.all(promises)
  }

  turnOn(name) {
    return this._huecall("on", name, [])
  }

  turnOff(name) {
    return this._huecall("off", name, [])
  }

  allOn() {
    return this._huebroadcast("on", [])
  }

  allOff() {
    return this._huebroadcast("off", [])
  }

}

module.exports.Hue = Hue;
