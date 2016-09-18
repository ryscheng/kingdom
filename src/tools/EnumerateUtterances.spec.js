/*global describe, it, before, after, beforeEach, afterEach*/
"use strict";

const expect = require("chai").expect;
const EnumerateUtterances = require("./EnumerateUtterances");

describe("EnumerateUtterances", function() {
  const plugin = {
    "name": "Testing plugin",
    "intents": {
      "intent1": {
        "name": "Intent1",
        "description": "",
        "callback": function() {},
        "parameters": [
          { "name": "appetizer", "type": "FOOD" },
          { "name": "beverage", "type": "DRINK" },
          { "name": "location", "type": "PLACE" },
        ],
        "utterances": [
          "I need a *beverage",
          "I'll have the *appetizer with a *beverage at the *location",
          "I don't know what I want",
        ]
      },
      "intent2": {
        "name": "Intent2",
        "description": "",
        "callback": function() {},
        "parameters": [
          { "name": "appetizer", "type": "FOOD" },
          { "name": "entree", "type": "FOOD" },
          { "name": "dessert", "type": "FOOD" },
        ],
        "utterances": [
          "I'll have the *appetizer and a *entree an a *dessert",
          "I don't know what I want"
        ]
      }
    },
    "types": {
      "FOOD": [ "rice", "noodle", "fruit" ],
      "DRINK": [ "soda", "juice", "milk" ],
      "PLACE": [ "restaurant", "home" ],
    }
  };

  beforeEach(function() {
  });

  afterEach(function() {
  });

  describe("#arrayToString", function() {
    it("converts an array", function() {
      const array = [ "1", "2", "3", "4", "5" ];
      const result = EnumerateUtterances.arrayToString(array);
      expect(result).to.equal("1 2 3 4 5");
    });

    it("converts a single element array", function() {
      const result = EnumerateUtterances.arrayToString(["hello"]);
      expect(result).to.equal("hello");
    });

    it("converts an non-array", function() {
      let result = EnumerateUtterances.arrayToString(100);
      expect(result).to.equal("");
      result = EnumerateUtterances.arrayToString("foo");
      expect(result).to.equal("");
      result = EnumerateUtterances.arrayToString({"a": 1});
      expect(result).to.equal("");
    });
  });

  describe("#enumerateParameter", function() {
    it("enumerates parameter values", function() {
      const result = EnumerateUtterances.enumerateParameter("appetizer", plugin.intents["intent1"].parameters, plugin.types);
      expect(result.length).to.equal(plugin.types["FOOD"].length)
      expect(result).to.include.members(plugin.types["FOOD"]);
    });

    it("missing parameter", function() {
      const result = EnumerateUtterances.enumerateParameter("blah", plugin.intents["intent1"].parameters, plugin.types);
      expect(result).to.be.instanceof(Array);
      expect(result).to.be.empty;
    });

    it("missing type", function() {
      const result = EnumerateUtterances.enumerateParameter("appetizer", plugin.intents["intent1"].parameters, {});
      expect(result).to.be.instanceof(Array);
      expect(result).to.be.empty;
    });
  });

  describe("#processUtterance", function() {
    it("processes a complex utterance", function() {
      const parameters = plugin.intents["intent1"].parameters;
      const types = plugin.types;
      let result = EnumerateUtterances.processUtterance("I'll have the *appetizer with a *beverage at the *location", parameters, types);
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(18);
      expect(result).to.include("I'll have the noodle with a milk at the home");
    });
  });

  describe("#processPlugin", function() {
    it("processes a complex plugin", function() {
      const result = EnumerateUtterances.processPlugin(plugin);
      expect(result).to.have.lengthOf(50);
      expect(result).to.include("I need a juice");
      expect(result).to.include("I'll have the noodle with a milk at the home");
      expect(result).to.include("I don't know what I want");
      expect(result).to.include("I'll have the rice and a rice an a rice");
      expect(result).to.include("I'll have the fruit and a noodle an a rice");
    });

    it("processes an empty plugin", function() {
      let result = EnumerateUtterances.processPlugin({});
      expect(result).to.be.instanceof(Array);
      expect(result).to.be.empty;
      result = EnumerateUtterances.processPlugin({ "intents": 1 });
      expect(result).to.be.instanceof(Array);
      expect(result).to.be.empty;
      result = EnumerateUtterances.processPlugin({ "intents": { "utterances": 1 }});
      expect(result).to.be.instanceof(Array);
      expect(result).to.be.empty;
    });
  });
});

