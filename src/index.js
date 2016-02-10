"use strict";

const config = require("config");

// Init assistant
const Assistant = require("./Assistant");
const app = new Assistant(); 
/** DRIVERS **/
/////// http://192.168.0.13/debug/clip.html
const Lights = require("./drivers/Lights");
const lights = new Lights(config.get("app.name"), config.get("hue.addr"));
const Voice = require("./drivers/Voice");
const voice = new Voice();
/** PLUGINS **/
const Weather = require("./plugins/Weather");
const weather = new Weather();
app.addPlugin(weather);
const LightControl = require("./plugins/LightControl");
const lightControl = new LightControl(lights);
app.addPlugin(lightControl);
const HypeMachine = require("./plugins/HypeMachine");
const hypem = new HypeMachine(config.get("hypem.username"));
app.addPlugin(hypem);
/** I/O **/
const CLI = require("./interfaces/CLI");
const cli = new CLI();
app.addInterface(cli);
const SpeakInterface = require("./interfaces/SpeakInterface");
const speakInterface = new SpeakInterface(voice);
app.addInterface(speakInterface);

app.printTriggers();
cli.startListening();
//speakInterface.startListening();
