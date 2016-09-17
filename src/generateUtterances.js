"use strict";

const Init = require("./Initialize");
const EnumerateUtterances = require("./tools/EnumerateUtterances");
const fs = require("fs");

let result = [];

const drivers = Init.initDrivers();
const plugins = Init.initPlugins(drivers);

// For each plugin
Object.keys(plugins).forEach((k1) => {
  let plugin = plugins[k1];
  result = result.concat(EnumerateUtterances.processPlugin(plugin))
});

// Convert to string
let resultStr = ""
for (let i = 0; i < result.length; i++) {
  resultStr += result[i] + "\n";
}
console.log("---RESULT---");
console.log(resultStr);

// Write result to file
