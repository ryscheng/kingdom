"use strict";

const Init = require("./Initialize");

// Necessary for hype.js
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Init assistant
const Assistant = require("./Assistant");
const app = new Assistant();
// Drivers
const drivers = Init.initDrivers();
Object.keys(drivers).forEach((k) => {
  drivers[k].start();
});
// Plugins
const plugins = Init.initPlugins(drivers);
Object.keys(plugins).forEach((k) => {
  app.addPlugin(plugins[k]);
});
// Interfaces
const interfaces = Init.initInterfaces(drivers);
Object.keys(interfaces).forEach((k) => {
  app.addInterface(interfaces[k]);
});

app.printIntents();
