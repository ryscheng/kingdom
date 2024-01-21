"use strict";

/**
 * @typedef {Object} Plugin
 * @property {Object.<string,PluginIntent>} intents - map of intent name to intent data structure (see below)
 * @property {Object.<string, Array.<String>>} types - map of type name to possible values of the type (e.g. CITY => ["Seattle", "Chicago"])
 **/


/**
 * @typedef {Object} PluginIntent
 * @property {string} name - Name of the intent
 * @property {string} description - Short description of intent
 * @property {intentCallback} callback - Callback function
 * @property {Array.<PluginParameter>} parameters - List of parameters used in the utterances. Defines the types to expect
 * @property {Array.<string>} utterances - Array of utterances in Annyang format
 **/

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback intentCallback
 * @param {...Object} parameters - Variable list of parameters from utterance
 **/

/**
 * @typedef {Object} PluginParameter
 * @property {string} name - name of the parameter. Used to match in the utterance expression
 * @property {string} type - name of the expected type. Used to lookup in Plugin.types
 **/
