"use strict";
var Hue = require("./core/Hue").Hue
var PocketSphinx = require('pocketsphinx').ps;

/**
var hueClient = new Hue("192.168.0.13");

hueClient.getLights().then((result) => {
  console.log(result);
  return hueClient.allOff();
}).then((result) => {
  console.log("!1!", result);
}).catch((err) => {
  console.error(err)
})
**/

var psConfig = new PocketSphinx.Decoder.defaultConfig();
console.log(psConfig)
