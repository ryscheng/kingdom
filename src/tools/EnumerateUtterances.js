"use strict";

/**
 * 
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

function enumerateParameter(paramName, parameters, types) {
  for (let i = 0; i < parameters.length; i++) {
    if (parameters[i].name === paramName) {
      return types[parameters[i].type];
    }
  }
}

function arrayToString(array) {
  if (array.length < 1) {
    return "";
  } else if (array.length === 1) {
    return array[0];
  } else {
    let result = array[0];
    for (let i = 1; i < array.length; i++) {
      result = result + " " + array[i];
    }
    return result;
  }
}

module.exports.processPlugin = processPlugin;
