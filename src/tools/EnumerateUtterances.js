"use strict";

/** 
 * Module for enumerating all possible utterances of a Kingdom plugin
 * @module
 **/

/**
 * Enumerates all of the utterances of a plugin
 *   This is the main function of the module
 * @param {Plugin} plugin
 * @return {Array.<string>} array of utterances
 **/
function processPlugin(plugin) {
  let result = [];
  // For each intent in plugin
  for (let k in plugin.intents) {
    if (plugin.intents.hasOwnProperty(k)) {
      let intent = plugin.intents[k];
      // For each utterance in plugin
      for (let i = 0; i < intent.utterances.length; i++) {
        let utterance = intent.utterances[i];
        result = result.concat(processUtterance(utterance, intent.parameters, plugin.types));
      }
    }
  }
  return result;
}

/**
 * Enumerates the possible literal utterances from a single expression.
 *  e.g. "turn the lights *Toggle" => ["turn the lights on", "turn the lights off"]
 * @param {string} utterance - Utterance expression 
 * @param {Array.<PluginParameter>} parameters - from PluginIntent.parameters
 * @param {Object.<string, Array.<String>>} types - from Plugin.types
 * @return {Array.<string>} array of utterances
 **/
function processUtterance(utterance, parameters, types) {
  let result = [];
  let tokens = utterance.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].charAt(0) === "*") {
      let paramName = tokens[i].slice(1);
      let paramValues = enumerateParameter(paramName, parameters, types)
      for (let j = 0; j < paramValues.length; j++) {
        let paramVal = paramValues[j];
        let tokensCopy = tokens.slice();
        tokensCopy[i] = paramVal;
        let utteranceCopy = arrayToString(tokensCopy)
        result = result.concat(processUtterance(utteranceCopy, parameters, types));
      }
      return result;
    }
  }
  result.push(utterance);
  return result;
}

/**
 * Enumerates the possible values of a parameter
 *  e.g Toggle => ["on", "off"]
 * @param {string} paramName - name of the parameter
 * @param {Array.<PluginParameter>} parameters - from PluginIntent.parameters
 * @param {Object.<string, Array.<String>>} types - from Plugin.types
 * @return {Array.<string>} array of possible values
 **/
function enumerateParameter(paramName, parameters, types) {
  for (let i = 0; i < parameters.length; i++) {
    if (parameters[i].name === paramName) {
      return types[parameters[i].type];
    }
  }
}

/**
 * Converts an array of strings into a single space-delimited string
 * @param {Array.<string>} array
 * @return {string}
 **/
function arrayToString(array) {
  if (array.length < 1) {
    return "";
  } else if (array.length === 1) {
    return array[0];
  }

  let result = array[0];
  for (let i = 1; i < array.length; i++) {
    result = result + " " + array[i];
  }
  return result;
}

module.exports.processPlugin = processPlugin;
module.exports.processUtterance = processUtterance;
module.exports.enumerateParameter = enumerateParameter;
module.exports.arrayToString= arrayToString;
