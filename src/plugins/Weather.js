"use strict";

let weather = require("weather-js");
let Q = require("q");

const DEFAULT = "98195";

class Weather {
  constructor() {
    // Public properties
    this.name = "Weather"
    this.intents = {
      "query": {
        "name": "query",
        "description": "Get the current weather",
        "callback": this.getWeather.bind(this),
        "parameters": [ { "name": "Location", "type": "CITY" }, ],
        "utterances": [
          "weather",
          "what is the weather",
          "what's the weather",
          "weather in *Location",
          "what is the weather in *Location",
          "what's the weather in *Location",
        ],
      }
    };
    this.types = {
      "CITY": [
        "Seattle",
        "New York",
        "Los Angeles",
        "San Francisco",
        "Boston",
        "Chicago",
        "Hong Kong",
        "London",
      ],
    };
    /**
    this.triggers = {
      "(what) (what's) (is) (the) weather (in) *searchQuery": this.getWeather.bind(this)
    };
     **/
  }

  getWeather(searchQuery) {
    console.log("Weather.getWeather("+searchQuery+")");
    // Set defaults
    if (searchQuery === "" ||
        searchQuery === null ||
        typeof searchQuery === "undefined") {
      searchQuery = DEFAULT;
    }

    return Q.npost(weather, "find", [{
      "search": searchQuery,
      "degreeType": "F"
    }]).then((result) => {
      //console.log(result);
      let response;
      if (result.length <= 0) {
        response = "I didn't get the location"
      } else {
        result = result[0];
        response = result.current.skytext +
          " and " + result.current.temperature + " degrees" +
          " in " + result.location.name;
      }
      return Promise.resolve(response);
    });
  }
}

module.exports = Weather;

    /**
    let debug = through(function write(data) {
      console.log(data);
      this.queue(data);
    }, function end() {
      console.log("end");
    });
    **/

