"use strict";

const winston = require("winston");
const Q = require("q");
const hue = require("hue.js");

/**
 * Class representing the Lights driver
 * Interacts with the Philips Hue system to turn lights on and off
 **/
class Lights {

  /**
   * Create a Lights driver
   * @param {string} appName - name of the application to register with the Hue bridge
   * @param {string} addr - IP address of the Hue bridge
   **/
  constructor(appName, addr) {
    this.log = winston.loggers.get("drivers");
    this._appName = appName;
    this._addr = addr;
    this._client = hue.createClient({
      "stationIp": addr,
      "appName": appName
    });
    this._cacheLights = {};

    this.log.info("Lights driver initialized");
  }
  
  /********************************
   * PUBLIC METHODS
   ********************************/
  
  /**
   * Start the driver
   * Tries to register with the Hue bridge if necessary.
   * If first time running with this 'appName', then you may
   *  need to push the physical button on the bridge when prompted
   * @return {Promise} resolves when done
   **/
  start() {
    this.log.info("Lights.start()");
    // Try to get the list of lights.
    return Q.npost(this._client, "lights", []).then((lights) => {
      this._cacheLights = lights;
      return Promise.resolve();
    }).catch((err) => {
      // If we need to register, try to handle that first
      if (err.type === 1) {
        this.log.info("Please go and press the link button on your base station(s)");
        return Q.npost(this._client, "register", []);
      } 
      return Promise.reject(err);
    });
  }

  /**
   * Stop the driver
   * Does nothing
   * @return {Promise} resolves when done
   **/
  stop() {
    this.log.info("Lights.stop()");
    return Promise.resolve();
  }

  /**
   *
   * @return {Object.<string, Object>} name -> {
   *  on: bool    // light is on/off
   * }
   **/
  getState() {
    return Q.ninvoke(this._client, "lights").then((result) => {
      let ret = {};
      this._cacheLights = result;
      for (let k in result) {
        if (result.hasOwnProperty(k)) {
          ret[result[k].name] = {
            "on": result[k].state.on
          };
        }
      }
      return Promise.resolve(ret);
    });
  }

  turnOn(name) {
    return this._huecall("on", name, []);
  }

  turnOff(name) {
    return this._huecall("off", name, []);
  }

  allOn() {
    return this._huebroadcast("on", []);
  }

  allOff() {
    return this._huebroadcast("off", []);
  }

  
  /********************************
   * PRIVATE METHODS
   ********************************/

  _huecall(method, name, args) {
    for (let k in this._cacheLights) {
      if (this._cacheLights.hasOwnProperty(k) && this._cacheLights[k].name === name) {
        return Q.npost(this._client, method, [k].concat(args));
      }
    }
  }

  _huebroadcast(method, args) {
    let promises = [];
    for (let k in this._cacheLights) {
      if (this._cacheLights.hasOwnProperty(k)) {
        promises.push(Q.npost(this._client, method, [k].concat(args)));
      }
    }
    return Q.all(promises);
  }
  
}

module.exports = Lights;
