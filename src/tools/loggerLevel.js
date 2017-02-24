"use strict";

const winston = require("winston");
const Initialize = require("../Initialize");

module.exports.setLevel = function(level) {
  Initialize.loggerNames.forEach((name) => {
    let log = winston.loggers.get(name);
    log.transports.console.level = level;
  });
};

