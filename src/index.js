"use strict";

const Init = require("./Initialize");

// Necessary for hype.js
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

function forEach(obj, cb) {
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      cb(obj[k]);
    }
  }
}

// Init assistant
const Assistant = require("./Assistant");
const app = new Assistant();
const drivers = Init.initDrivers();
const plugins = Init.initPlugins(drivers);
forEach(plugins, app.addPlugin.bind(app));
const interfaces = Init.initInterfaces(drivers);
forEach(interfaces, app.addInterface.bind(app));

app.printTriggers();
interfaces.cli.startListening();
//speakInterface.startListening();
