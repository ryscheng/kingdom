"use strict";
var Q = require("q");
var hue = require("hue.js");

class Lights {
  constructor(appName, addr) {
    this._appName = appName;
    this._addr = addr;
    this._client = hue.createClient({
      stationIp: addr,
      appName: appName
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
        // Already registered, no errors
      }
    });
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
  
  /**
   *
   * @return {Object.<string, Object>} name -> {
   *  on: bool    // light is on/off
   * }
   **/
  getState() {
    return Q.ninvoke(this._client, "lights").then((result) => {
      var ret = {};
      this._cacheLights = lights;
      //console.log(lights);
      for (var k in result) {
        if (result.hasOwnProperty(k)) {
          ret[result[k].name] = {
            on: result[k].state.on
          }
        }
      }
      //console.log(ret);
      return Promise.resolve(ret);
    });
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

module.exports = Lights;
