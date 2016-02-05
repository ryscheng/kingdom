"use strict";

const readline = require("readline");
const Assistant = require("./Assistant"); 
const Weather = require("./plugins/Weather");

// Setup Assistant
const app = new Assistant();
const weather = new Weather();
app.addPlugin(weather);
app.initialize();

// Setup CLI
const rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("Yes?>");
rl.prompt();
rl.on("line", (line) => {
  app.command(line.trim());
  rl.prompt();
}).on("close", () => {
  console.log("Have a great day!");
  process.exit(0);
});

