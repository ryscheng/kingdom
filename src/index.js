"use strict";

const readline = require("readline");
const Assistant = require("./Assistant"); 
const Lights = require("./drivers/Lights");
const Weather = require("./plugins/Weather");
const LightControl = require("./plugins/LightControl");
const HypeMachine = require("./plugins/HypeMachine");

const APP_NAME = "cray";
const HUE_BRIDGE_IP = "192.168.0.13"; //http://192.168.0.13/debug/clip.html
const HYPEM_USERNAME = "djmontagged"

// Init assistant
const app = new Assistant();
// Init drivers
const lights = new Lights(APP_NAME, HUE_BRIDGE_IP);
// Init plugins
const weather = new Weather();
const lightControl = new LightControl(lights);
const hypem = new HypeMachine(HYPEM_USERNAME);
app.addPlugin(weather);
app.addPlugin(lightControl);
app.addPlugin(hypem);
app.printTriggers();

// Setup CLI
const rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("Yes?>");
rl.prompt();
rl.on("line", (line) => {
  app.command(line.trim());
  rl.prompt();
}).on("close", () => {
  console.log("\nHave a great day!");
  process.exit(0);
});

