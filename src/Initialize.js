"use strict";

const config = require("config");
const winston = require("winston");

const LOGGER_NAMES = [
  "core",
  "drivers",
  "plugins",
  "interfaces",
  "misc",
];

// Logging
function createLogger(name) {
  winston.loggers.add(name, {
    "console": {
      "timestamp": true,
      "colorize": true,
      "label": name,
      "level": "debug",
    },
    //file: { filename: "" },
  });
}
LOGGER_NAMES.forEach((name) => {
  createLogger(name);
});

function initDrivers() {
  /////// http://192.168.0.13/debug/clip.html
  const Lights = require("./drivers/Lights");
  const AudioOut = require("./drivers/AudioOut");
  const SpeechIn = require("./drivers/SpeechIn");
  const ClapDetector = require("./drivers/ClapDetector");
  const Camera = require("./drivers/Camera");

  return {
    "lights": new Lights(config.get("app.name"), config.get("hue.addr")),
    "audioOut": new AudioOut(),
    "speechIn": new SpeechIn(config.get("pocketsphinx")),
    "clapDetector": new ClapDetector(config.get("clapDetector.deviceName")),
    "camera": new Camera(),
  };
}

function initPlugins(drivers) {
  const LightControl = require("./plugins/LightControl");
  const MusicControl = require("./plugins/MusicControl");
  const HypeMachine = require("./plugins/HypeMachine");
  const Weather = require("./plugins/Weather");
  
  return {
    "lightControl": new LightControl(drivers.lights),
    "musicControl": new MusicControl(drivers.audioOut, drivers.clapDetector),
    "hypeMachine": new HypeMachine(drivers.audioOut, config.get("hypem.username")),
    "weather": new Weather(),
  };
}

function initInterfaces(drivers) {
  const CLI = require("./interfaces/CLI");
  const SpeakInterface = require("./interfaces/SpeakInterface");
  //const Gmail = require("./interfaces/Gmail")

  return {
    "cli": new CLI(),
    "speakInterface": new SpeakInterface(drivers.speechIn, drivers.audioOut),
    //"gmail": new Gmail(config.get("google.auth.clientId"), config.get("google.auth.clientSecret"), config.get("google.auth.authCode"), config.get("google.gmail.authorizedUsers"), config.get("google.gmail.topic")),
  };
}

module.exports.initDrivers = initDrivers;
module.exports.initPlugins = initPlugins;
module.exports.initInterfaces = initInterfaces;
module.exports.loggerNames = LOGGER_NAMES;
