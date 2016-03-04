"use strict";

const config = require("config");

function initDrivers() {
  /////// http://192.168.0.13/debug/clip.html
  const Lights = require("./drivers/Lights");
  const AudioOut = require("./drivers/AudioOut");

  return {
    "lights": new Lights(config.get("app.name"), config.get("hue.addr")),
    "audioOut": new AudioOut(),
  };
}

function initPlugins(drivers) {
  const LightControl = require("./plugins/LightControl");
  const MusicControl = require("./plugins/MusicControl");
  const HypeMachine = require("./plugins/HypeMachine");
  const Weather = require("./plugins/Weather");
  
  return {
    "lightControl": new LightControl(drivers.lights),
    "musicControl": new MusicControl(drivers.audioOut),
    "hypeMachine": new HypeMachine(drivers.audioOut, config.get("hypem.username")),
    "weather": new Weather(),
  };
}

function initInterfaces(drivers) {
  const CLI = require("./interfaces/CLI");
  const SpeakInterface = require("./interfaces/SpeakInterface");

  return {
    "cli": new CLI(),
    "speakInterface": new SpeakInterface(drivers.audioOut),
  };
}

module.exports.initDrivers = initDrivers;
module.exports.initPlugins = initPlugins;
module.exports.initInterfaces = initInterfaces;
