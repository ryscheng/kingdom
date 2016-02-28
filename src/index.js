"use strict";

const config = require("config");

// Necessary for hype.js
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

// Init assistant
const Assistant = require("./Assistant");
const app = new Assistant(); 

/** DRIVERS **/
/////// http://192.168.0.13/debug/clip.html
const Lights = require("./drivers/Lights");
const lights = new Lights(config.get("app.name"), config.get("hue.addr"));
const AudioOut = require("./drivers/AudioOut");
const audioOut = new AudioOut();

/** PLUGINS **/
const LightControl = require("./plugins/LightControl");
app.addPlugin(new LightControl(lights));
const MusicControl = require("./plugins/MusicControl");
app.addPlugin(new MusicControl(audioOut));
const HypeMachine = require("./plugins/HypeMachine");
app.addPlugin(new HypeMachine(audioOut, config.get("hypem.username")));
const Weather = require("./plugins/Weather");
app.addPlugin(new Weather());

/** I/O **/
const CLI = require("./interfaces/CLI");
const cli = new CLI();
app.addInterface(cli);
const SpeakInterface = require("./interfaces/SpeakInterface");
const speakInterface = new SpeakInterface(audioOut);
app.addInterface(speakInterface);

app.printTriggers();
cli.startListening();
//speakInterface.startListening();
