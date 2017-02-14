"use strict";

const config = require("config");

function initDrivers() {
  /////// http://192.168.0.13/debug/clip.html
  const Lights = require("./drivers/Lights");
  const AudioOut = require("./drivers/AudioOut");
  const SpeechIn = require("./drivers/SpeechIn");
  const Camera = require("./drivers/Camera");

  return {
    "lights": new Lights(config.get("app.name"), config.get("hue.addr")),
    "audioOut": new AudioOut(),
    "speechIn": new SpeechIn(config.get("pocketsphinx")),
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
  const Gmail = require("./interfaces/Gmail")
  const SpeakInterface = require("./interfaces/SpeakInterface");

  return {
    "cli": new CLI(),
    //"gmail": new Gmail(config.get("google.auth.clientId"), config.get("google.auth.clientSecret"), config.get("google.auth.authCode"), config.get("google.gmail.authorizedUsers"), config.get("google.gmail.topic")),
    "speakInterface": new SpeakInterface(drivers.speechIn, drivers.audioOut),
  };
}

module.exports.initDrivers = initDrivers;
module.exports.initPlugins = initPlugins;
module.exports.initInterfaces = initInterfaces;
