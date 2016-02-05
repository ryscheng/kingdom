"use strict";

let weather = require("weather-js");
let Q = require("q");

const DEFAULT = "98195";

class Weather {
  constructor() {
  }

  getTriggers() {
    return {
      "weather (in) *searchQuery": this.getWeather.bind(this),
      "what is the weather (in) *searchQuery?": this.getWeather.bind(this)
    };
  }

  getWeather(searchQuery) {
    // Set defaults
    if (searchQuery == null || typeof searchQuery === "undefined") {
      searchQuery = DEFAULT;
    }

    Q.npost(weather, "find", [{
      search: searchQuery,
      degreeType: "F"
    }]).then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err)
    });
  }
}

module.exports.Weather = Weather;
